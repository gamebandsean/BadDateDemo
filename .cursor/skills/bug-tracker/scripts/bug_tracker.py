#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bug tracker skill helper script for managing project bugs.

Usage:
    bug_tracker.py open <title> [--severity=<sev>] [--description=<desc>]
    bug_tracker.py get <bug_id>
    bug_tracker.py update <bug_id> [--status=<s>] [--severity=<s>] [--add-note=<n>] [--add-file=<f>] [--add-tag=<t>]
    bug_tracker.py close <bug_id> <resolution> [--solution=<sol>]
    bug_tracker.py attempt <bug_id> <description> <result> [--reverted]
    bug_tracker.py list [--status=<status>] [--severity=<sev>]
    bug_tracker.py search <query>
    bug_tracker.py link <bug_id1> <bug_id2>
    bug_tracker.py stats
"""

import json
import os
import re
import sys
from datetime import date
from pathlib import Path
from typing import Optional


def get_project_root() -> Path:
    """Find project root by looking for .cursor, .claude, or .git directory."""
    current = Path.cwd()
    while current != current.parent:
        if (current / ".cursor").exists() or (current / ".claude").exists() or (current / ".git").exists():
            return current
        current = current.parent
    return Path.cwd()


def get_bugs_dir() -> Path:
    """Get the bugs directory, creating if needed.

    Storage location: <project_root>/data/bugs/
    This shared data folder can be used by other tools/agents/skills
    and can be selectively versioned via .gitignore patterns.
    """
    project_root = get_project_root()
    bugs_dir = project_root / "data" / "bugs"
    bugs_dir.mkdir(parents=True, exist_ok=True)
    return bugs_dir


def kebab_case(text: str) -> str:
    """Convert text to kebab-case."""
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[\s_]+', '-', text)
    return re.sub(r'-+', '-', text).strip('-')[:50]


def get_next_bug_id() -> int:
    """Get the next available bug ID."""
    bugs_dir = get_bugs_dir()
    existing = list(bugs_dir.glob("BUG-*.md"))
    if not existing:
        return 1

    ids = []
    for f in existing:
        match = re.match(r'BUG-(\d+)', f.stem)
        if match:
            ids.append(int(match.group(1)))

    return max(ids) + 1 if ids else 1


def find_bug_file(bug_id: str) -> Optional[Path]:
    """Find a bug file by ID."""
    bugs_dir = get_bugs_dir()
    # Normalize bug_id (accept "42", "BUG-42", "BUG-0042")
    if bug_id.upper().startswith("BUG-"):
        bug_id = bug_id[4:]

    try:
        bug_num = int(bug_id)
    except ValueError:
        print(f"Invalid bug ID: {bug_id}. Must be a number (e.g., 42, BUG-42, BUG-0042)", file=sys.stderr)
        sys.exit(1)

    # Try exact match first
    for pattern in [f"BUG-{bug_num:04d}-*.md", f"BUG-{bug_num}-*.md"]:
        matches = list(bugs_dir.glob(pattern))
        if matches:
            return matches[0]

    return None


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from markdown content."""
    if not content.startswith("---"):
        return {}, content

    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}, content

    frontmatter = {}
    for line in parts[1].strip().split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip()
            # Parse lists
            if value.startswith("[") and value.endswith("]"):
                value = [v.strip().strip('"\'') for v in value[1:-1].split(",") if v.strip()]
            frontmatter[key] = value

    return frontmatter, "---" + parts[1] + "---" + parts[2]


def format_frontmatter(fm: dict) -> str:
    """Format frontmatter dict as YAML."""
    lines = ["---"]
    for key, value in fm.items():
        if isinstance(value, list):
            lines.append(f"{key}: [{', '.join(value)}]")
        else:
            lines.append(f"{key}: {value}")
    lines.append("---")
    return "\n".join(lines)


def today() -> str:
    """Get today's date as YYYY-MM-DD."""
    return date.today().isoformat()


def cmd_open(title: str, severity: str = "medium", description: str = "") -> None:
    """Open a new bug."""
    if not title or not title.strip():
        print("Error: Bug title cannot be empty", file=sys.stderr)
        sys.exit(1)

    valid_severities = ['critical', 'high', 'medium', 'low']
    if severity not in valid_severities:
        print(f"Invalid severity: {severity}. Must be one of: {valid_severities}", file=sys.stderr)
        sys.exit(1)

    bugs_dir = get_bugs_dir()
    bug_num = get_next_bug_id()
    bug_id = f"BUG-{bug_num:04d}"
    filename = f"{bug_id}-{kebab_case(title)}.md"
    filepath = bugs_dir / filename

    # Check for potential duplicates
    search_terms = title.lower().split()
    for existing in bugs_dir.glob("BUG-*.md"):
        content = existing.read_text(encoding="utf-8").lower()
        if all(term in content for term in search_terms[:3]):
            print(f"Warning: Possible duplicate - {existing.name}", file=sys.stderr)

    content = f"""---
id: {bug_id}
title: {title}
status: open
severity: {severity}
created: {today()}
updated: {today()}
related-files: []
tags: []
---

## Description

{description if description else '<Clear description of the bug behavior>'}

## Expected Behavior

<What should happen instead>

## Reproduction Steps

1. <Step 1>
2. <Step 2>
3. <Step 3>

## Environment

- OS: <operating system>
- Version: <app/library version>

## Investigation Notes

<Findings from debugging, log analysis, code review>

## Probable Cause

<Best guess at what's causing the issue based on investigation>

## Attempted Fixes

<Record each fix attempt here>

## Solution

<Final fix that resolved the issue - only filled when closed as fixed>

## Related

- Related bugs:
- Related PRs/commits:
"""

    filepath.write_text(content, encoding="utf-8")
    print(f"Created {bug_id}: {filepath.name}")
    print(f"Path: {filepath}")


def cmd_get(bug_id: str) -> None:
    """Get details of a bug."""
    filepath = find_bug_file(bug_id)
    if not filepath:
        print(f"Bug {bug_id} not found", file=sys.stderr)
        sys.exit(1)

    content = filepath.read_text(encoding="utf-8")
    fm, _ = parse_frontmatter(content)

    print(f"ID: {fm.get('id', 'N/A')}")
    print(f"Title: {fm.get('title', 'N/A')}")
    print(f"Status: {fm.get('status', 'N/A')}")
    print(f"Severity: {fm.get('severity', 'N/A')}")
    print(f"Created: {fm.get('created', 'N/A')}")
    print(f"Updated: {fm.get('updated', 'N/A')}")
    if fm.get('closed'):
        print(f"Closed: {fm.get('closed')}")
    if fm.get('resolution'):
        print(f"Resolution: {fm.get('resolution')}")
    print(f"File: {filepath}")


def cmd_update(bug_id: str, status: str = None, severity: str = None, note: str = None,
               add_file: str = None, add_tag: str = None) -> None:
    """Update a bug's status, severity, related files, tags, or add investigation notes."""
    filepath = find_bug_file(bug_id)
    if not filepath:
        print(f"Bug {bug_id} not found", file=sys.stderr)
        sys.exit(1)

    content = filepath.read_text(encoding="utf-8")
    fm, full_content = parse_frontmatter(content)

    updated = False

    if status and status != fm.get('status'):
        valid_statuses = ['open', 'in-progress', 'closed']
        if status not in valid_statuses:
            print(f"Invalid status: {status}. Must be one of: {valid_statuses}", file=sys.stderr)
            sys.exit(1)
        fm['status'] = status
        updated = True

    if severity and severity != fm.get('severity'):
        valid_severities = ['critical', 'high', 'medium', 'low']
        if severity not in valid_severities:
            print(f"Invalid severity: {severity}. Must be one of: {valid_severities}", file=sys.stderr)
            sys.exit(1)
        fm['severity'] = severity
        updated = True

    if add_file:
        related_files = fm.get('related-files', [])
        if isinstance(related_files, str):
            related_files = [related_files] if related_files else []
        if add_file not in related_files:
            related_files.append(add_file)
            fm['related-files'] = related_files
            updated = True

    if add_tag:
        tags = fm.get('tags', [])
        if isinstance(tags, str):
            tags = [tags] if tags else []
        if add_tag not in tags:
            tags.append(add_tag)
            fm['tags'] = tags
            updated = True

    if note:
        # Add note to Investigation Notes section
        marker = "## Investigation Notes"
        if marker in full_content:
            idx = full_content.index(marker) + len(marker)
            next_section = full_content.find("\n## ", idx)
            if next_section == -1:
                next_section = len(full_content)

            existing_notes = full_content[idx:next_section].strip()
            new_note = f"\n\n**[{today()}]** {note}"

            full_content = (
                full_content[:idx] +
                "\n\n" + (existing_notes if existing_notes and not existing_notes.startswith("<") else "") +
                new_note +
                "\n" +
                full_content[next_section:]
            )
            updated = True

    if updated:
        fm['updated'] = today()
        # Reconstruct content with updated frontmatter
        body_start = full_content.index("---", 3) + 3
        new_content = format_frontmatter(fm) + full_content[body_start:]
        filepath.write_text(new_content, encoding="utf-8")
        print(f"Updated {fm.get('id', bug_id)}")
    else:
        print("No changes made")


def cmd_close(bug_id: str, resolution: str, solution: str = None) -> None:
    """Close a bug with a resolution."""
    valid_resolutions = ['fixed', 'wont-fix', 'duplicate', 'cannot-reproduce', 'by-design']
    if resolution not in valid_resolutions:
        print(f"Invalid resolution: {resolution}. Must be one of: {valid_resolutions}", file=sys.stderr)
        sys.exit(1)

    filepath = find_bug_file(bug_id)
    if not filepath:
        print(f"Bug {bug_id} not found", file=sys.stderr)
        sys.exit(1)

    content = filepath.read_text(encoding="utf-8")
    fm, full_content = parse_frontmatter(content)

    fm['status'] = 'closed'
    fm['closed'] = today()
    fm['updated'] = today()
    fm['resolution'] = resolution

    if solution and resolution == 'fixed':
        # Update Solution section
        marker = "## Solution"
        if marker in full_content:
            idx = full_content.index(marker) + len(marker)
            next_section = full_content.find("\n## ", idx)
            if next_section == -1:
                next_section = len(full_content)

            full_content = (
                full_content[:idx] +
                f"\n\n{solution}\n" +
                full_content[next_section:]
            )

    # Reconstruct content with updated frontmatter
    body_start = full_content.index("---", 3) + 3
    new_content = format_frontmatter(fm) + full_content[body_start:]
    filepath.write_text(new_content, encoding="utf-8")
    print(f"Closed {fm.get('id', bug_id)} as {resolution}")


def cmd_attempt(bug_id: str, description: str, result: str, reverted: bool = False) -> None:
    """Record a fix attempt on a bug."""
    if not description or not description.strip():
        print("Error: Attempt description cannot be empty", file=sys.stderr)
        sys.exit(1)
    if not result or not result.strip():
        print("Error: Attempt result cannot be empty", file=sys.stderr)
        sys.exit(1)

    filepath = find_bug_file(bug_id)
    if not filepath:
        print(f"Bug {bug_id} not found", file=sys.stderr)
        sys.exit(1)

    content = filepath.read_text(encoding="utf-8")
    fm, full_content = parse_frontmatter(content)

    # Find Attempted Fixes section and count existing attempts
    marker = "## Attempted Fixes"
    if marker not in full_content:
        print("Could not find Attempted Fixes section", file=sys.stderr)
        sys.exit(1)

    idx = full_content.index(marker) + len(marker)
    next_section = full_content.find("\n## ", idx)
    if next_section == -1:
        next_section = len(full_content)

    existing = full_content[idx:next_section]
    attempt_count = len(re.findall(r"### Attempt \d+", existing))
    new_attempt_num = attempt_count + 1

    new_attempt = f"""

### Attempt {new_attempt_num}: {description}
- **Date:** {today()}
- **Changes:** {description}
- **Result:** {result}
- **Reverted:** {"yes" if reverted else "no"}
"""

    full_content = (
        full_content[:next_section].rstrip() +
        new_attempt +
        "\n" +
        full_content[next_section:]
    )

    fm['updated'] = today()
    if fm.get('status') == 'open':
        fm['status'] = 'in-progress'

    # Reconstruct content with updated frontmatter
    body_start = full_content.index("---", 3) + 3
    new_content = format_frontmatter(fm) + full_content[body_start:]
    filepath.write_text(new_content, encoding="utf-8")
    print(f"Recorded attempt {new_attempt_num} on {fm.get('id', bug_id)}")


def cmd_list(status: str = None, severity: str = None) -> None:
    """List bugs, optionally filtered by status or severity."""
    bugs_dir = get_bugs_dir()
    bugs = []

    for filepath in sorted(bugs_dir.glob("BUG-*.md")):
        content = filepath.read_text(encoding="utf-8")
        fm, _ = parse_frontmatter(content)

        if status and fm.get('status') != status:
            continue
        if severity and fm.get('severity') != severity:
            continue

        bugs.append({
            'id': fm.get('id', filepath.stem),
            'title': fm.get('title', 'N/A'),
            'status': fm.get('status', 'N/A'),
            'severity': fm.get('severity', 'N/A'),
            'file': filepath.name
        })

    if not bugs:
        print("No bugs found")
        return

    print(f"{'ID':<12} {'Status':<12} {'Severity':<10} Title")
    print("-" * 70)
    for bug in bugs:
        print(f"{bug['id']:<12} {bug['status']:<12} {bug['severity']:<10} {bug['title'][:40]}")


def cmd_search(query: str) -> None:
    """Search bugs by keyword."""
    bugs_dir = get_bugs_dir()
    query_lower = query.lower()
    matches = []

    for filepath in bugs_dir.glob("BUG-*.md"):
        content = filepath.read_text(encoding="utf-8")
        if query_lower in content.lower():
            fm, _ = parse_frontmatter(content)
            matches.append({
                'id': fm.get('id', filepath.stem),
                'title': fm.get('title', 'N/A'),
                'status': fm.get('status', 'N/A'),
                'file': filepath.name
            })

    if not matches:
        print(f"No bugs found matching '{query}'")
        return

    print(f"Found {len(matches)} bug(s) matching '{query}':")
    for bug in matches:
        print(f"  {bug['id']} [{bug['status']}] - {bug['title']}")


def cmd_link(bug_id1: str, bug_id2: str) -> None:
    """Link two related bugs."""
    file1 = find_bug_file(bug_id1)
    file2 = find_bug_file(bug_id2)

    if not file1:
        print(f"Bug {bug_id1} not found", file=sys.stderr)
        sys.exit(1)
    if not file2:
        print(f"Bug {bug_id2} not found", file=sys.stderr)
        sys.exit(1)

    # Prevent self-linking
    if file1 == file2:
        print("Error: Cannot link a bug to itself", file=sys.stderr)
        sys.exit(1)

    # Get actual bug IDs from files
    content1 = file1.read_text(encoding="utf-8")
    content2 = file2.read_text(encoding="utf-8")
    fm1, _ = parse_frontmatter(content1)
    fm2, _ = parse_frontmatter(content2)

    id1 = fm1.get('id', bug_id1)
    id2 = fm2.get('id', bug_id2)

    # Update Related section in both files
    for filepath, other_id in [(file1, id2), (file2, id1)]:
        content = filepath.read_text(encoding="utf-8")
        if other_id not in content:
            # Find Related bugs line and append
            marker = "- Related bugs:"
            if marker in content:
                idx = content.index(marker) + len(marker)
                line_end = content.find("\n", idx)
                existing = content[idx:line_end].strip()
                if existing:
                    new_refs = f" {existing}, {other_id}"
                else:
                    new_refs = f" {other_id}"
                content = content[:idx] + new_refs + content[line_end:]
                filepath.write_text(content, encoding="utf-8")

    print(f"Linked {id1} <-> {id2}")


def cmd_stats() -> None:
    """Show bug statistics."""
    bugs_dir = get_bugs_dir()

    stats = {
        'total': 0,
        'by_status': {},
        'by_severity': {},
        'by_resolution': {}
    }

    for filepath in bugs_dir.glob("BUG-*.md"):
        content = filepath.read_text(encoding="utf-8")
        fm, _ = parse_frontmatter(content)

        stats['total'] += 1

        status = fm.get('status', 'unknown')
        stats['by_status'][status] = stats['by_status'].get(status, 0) + 1

        severity = fm.get('severity', 'unknown')
        stats['by_severity'][severity] = stats['by_severity'].get(severity, 0) + 1

        if status == 'closed':
            resolution = fm.get('resolution', 'unknown')
            stats['by_resolution'][resolution] = stats['by_resolution'].get(resolution, 0) + 1

    print(f"Total bugs: {stats['total']}")
    print("\nBy status:")
    for status, count in sorted(stats['by_status'].items()):
        print(f"  {status}: {count}")
    print("\nBy severity:")
    for severity, count in sorted(stats['by_severity'].items()):
        print(f"  {severity}: {count}")
    if stats['by_resolution']:
        print("\nClosed bug resolutions:")
        for resolution, count in sorted(stats['by_resolution'].items()):
            print(f"  {resolution}: {count}")


def print_usage():
    """Print usage information."""
    print(__doc__)
    sys.exit(1)


def main():
    if len(sys.argv) < 2:
        print_usage()

    cmd = sys.argv[1].lower()
    args = sys.argv[2:]

    try:
        if cmd == "open":
            if not args:
                print("Usage: bug_tracker.py open <title> [--severity=<sev>] [--description=<desc>]", file=sys.stderr)
                sys.exit(1)

            # Parse arguments
            title_parts = []
            severity = "medium"
            description = ""

            for arg in args:
                if arg.startswith("--severity="):
                    severity = arg.split("=", 1)[1]
                elif arg.startswith("--description="):
                    description = arg.split("=", 1)[1]
                else:
                    title_parts.append(arg)

            title = " ".join(title_parts)
            cmd_open(title, severity, description)

        elif cmd == "get":
            if len(args) != 1:
                print("Usage: bug_tracker.py get <bug_id>", file=sys.stderr)
                sys.exit(1)
            cmd_get(args[0])

        elif cmd == "update":
            if len(args) < 1:
                print("Usage: bug_tracker.py update <bug_id> [--status=<s>] [--severity=<s>] [--add-note=<n>] [--add-file=<f>] [--add-tag=<t>]", file=sys.stderr)
                sys.exit(1)

            bug_id = args[0]
            status = None
            severity = None
            note = None
            add_file = None
            add_tag = None

            for arg in args[1:]:
                if arg.startswith("--status="):
                    status = arg.split("=", 1)[1]
                elif arg.startswith("--severity="):
                    severity = arg.split("=", 1)[1]
                elif arg.startswith("--add-note="):
                    note = arg.split("=", 1)[1]
                elif arg.startswith("--add-file="):
                    add_file = arg.split("=", 1)[1]
                elif arg.startswith("--add-tag="):
                    add_tag = arg.split("=", 1)[1]

            cmd_update(bug_id, status, severity, note, add_file, add_tag)

        elif cmd == "close":
            if len(args) < 2:
                print("Usage: bug_tracker.py close <bug_id> <resolution> [--solution=<sol>]", file=sys.stderr)
                sys.exit(1)

            bug_id = args[0]
            resolution = args[1]
            solution = None

            for arg in args[2:]:
                if arg.startswith("--solution="):
                    solution = arg.split("=", 1)[1]

            cmd_close(bug_id, resolution, solution)

        elif cmd == "attempt":
            if len(args) < 3:
                print("Usage: bug_tracker.py attempt <bug_id> <description> <result> [--reverted]", file=sys.stderr)
                sys.exit(1)

            bug_id = args[0]
            description = args[1]
            result = args[2]
            reverted = "--reverted" in args

            cmd_attempt(bug_id, description, result, reverted)

        elif cmd == "list":
            status = None
            severity = None

            for arg in args:
                if arg.startswith("--status="):
                    status = arg.split("=", 1)[1]
                elif arg.startswith("--severity="):
                    severity = arg.split("=", 1)[1]

            cmd_list(status, severity)

        elif cmd == "search":
            if len(args) < 1:
                print("Usage: bug_tracker.py search <query>", file=sys.stderr)
                sys.exit(1)
            cmd_search(" ".join(args))

        elif cmd == "link":
            if len(args) != 2:
                print("Usage: bug_tracker.py link <bug_id1> <bug_id2>", file=sys.stderr)
                sys.exit(1)
            cmd_link(args[0], args[1])

        elif cmd == "stats":
            cmd_stats()

        else:
            print(f"Unknown command: {cmd}", file=sys.stderr)
            print_usage()

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
