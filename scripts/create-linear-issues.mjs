#!/usr/bin/env node
/**
 * Create Linear issues from scripts/linear-tasks.json.
 *
 * Prerequisites:
 *   1. Create a Personal API key: Linear → Settings → API → Personal API keys.
 *   2. Add to .env in project root: LINEAR_API_KEY=lin_api_...
 *   3. Optional: LINEAR_TEAM_ID=... (otherwise script fetches first team).
 *   4. Optional: LINEAR_PROJECT_ID=... to add issues to a project.
 *
 * Run from project root:
 *   node scripts/create-linear-issues.mjs
 *
 * Or with env inline:
 *   LINEAR_API_KEY=lin_api_xxx node scripts/create-linear-issues.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TASKS_PATH = join(__dirname, 'linear-tasks.json');

const LINEAR_API = 'https://api.linear.app/graphql';
const API_KEY = process.env.LINEAR_API_KEY;

if (!API_KEY) {
  console.error('Missing LINEAR_API_KEY. Add it to .env or set the env var.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: API_KEY,
};

async function graphql(query, variables = {}) {
  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Linear API ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

async function getTeamId() {
  const teamId = process.env.LINEAR_TEAM_ID;
  const teamName = process.env.LINEAR_TEAM_NAME;
  if (teamId) return teamId;
  const data = await graphql(`
    query {
      teams(first: 50) {
        nodes { id key name }
      }
    }
  `);
  const teams = data?.teams?.nodes ?? [];
  let team;
  if (teamName) {
    const want = teamName.trim().toLowerCase();
    team = teams.find(
      (t) =>
        t.name?.toLowerCase() === want || t.key?.toLowerCase() === want
    );
    if (!team) throw new Error(`No team named "${teamName}". Found: ${teams.map((t) => t.name || t.key).join(', ') || 'none'}`);
  } else {
    team = teams[0];
    if (!team) throw new Error('No team found. Set LINEAR_TEAM_ID or LINEAR_TEAM_NAME.');
  }
  console.log('Using team:', team.name, team.key, '(' + team.id + ')');
  return team.id;
}

async function createIssue(teamId, projectId, task) {
  const description = [
    task.track ? `**Track:** ${task.track}` : '',
    task.phase ? `**Phase:** ${task.phase}` : '',
    '',
    task.description,
  ]
    .filter(Boolean)
    .join('\n\n');

  const input = {
    teamId,
    title: task.title,
    description: description || undefined,
    ...(projectId && { projectId }),
  };

  const data = await graphql(
    `
      mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          issue { id identifier title }
          success
        }
      }
    `,
    { input }
  );

  const issue = data?.issueCreate?.issue;
  if (!issue) throw new Error('issueCreate returned no issue');
  return issue;
}

async function main() {
  const tasks = JSON.parse(readFileSync(TASKS_PATH, 'utf8'));
  const teamId = await getTeamId();
  const projectId = process.env.LINEAR_PROJECT_ID || null;

  console.log(`Creating ${tasks.length} issues in Linear...\n`);

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      const issue = await createIssue(teamId, projectId, task);
      console.log(`[${i + 1}/${tasks.length}] ${issue.identifier} ${issue.title}`);
    } catch (err) {
      console.error(`[${i + 1}/${tasks.length}] FAILED: ${task.title}`);
      console.error(err.message);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
