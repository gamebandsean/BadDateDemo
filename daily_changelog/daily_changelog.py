#!/usr/bin/env python3
"""
Daily Changelog Generator
Runs every weekday at 10am to summarize the most recent day that had git activity.
Walks backward from yesterday until it finds a day with commits (future-proof:
handles weekends, holidays, or any day with no changes).
Saves a txt file to the Desktop/Daily Changelog folder.
"""

import subprocess
import os
from datetime import datetime, timedelta
from pathlib import Path
import schedule
import time
import anthropic

# Configuration
REPO_PATH = "/Users/seankearney/BadDateDemo"
DESKTOP_PATH = Path.home() / "Desktop"
CHANGELOG_FOLDER = DESKTOP_PATH / "Daily Changelog"

def get_api_key():
    """Get API key from environment or .env file."""
    # First try environment variable
    key = os.environ.get("ANTHROPIC_API_KEY")
    if key:
        return key
    
    # Fall back to reading from .env file
    env_path = Path(REPO_PATH) / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if line.startswith("VITE_ANTHROPIC_API_KEY="):
                    return line.split("=", 1)[1].strip()
    return ""

ANTHROPIC_API_KEY = get_api_key()

# How far back to look for a day with commits (avoid infinite loop)
MAX_DAYS_BACK = 14


def get_commits_for_date(target_date):
    """Get all commit messages for a single calendar day. Returns (commit_text, target_date)."""
    day_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    since_str = day_start.strftime("%Y-%m-%d %H:%M:%S")
    until_str = day_end.strftime("%Y-%m-%d %H:%M:%S")
    try:
        result = subprocess.run(
            [
                "git", "log",
                f"--since={since_str}",
                f"--until={until_str}",
                "--pretty=format:%s%n%b---",
            ],
            cwd=REPO_PATH,
            capture_output=True,
            text=True,
            check=True,
        )
        out = result.stdout.strip()
        return out, target_date
    except subprocess.CalledProcessError as e:
        print(f"Error getting git log for {target_date.date()}: {e}")
        return "", target_date


def find_most_recent_day_with_commits():
    """
    Start from yesterday and walk backward until we find a day that has at least one commit.
    Returns (commit_text, target_date) or (None, None) if no commits in the last MAX_DAYS_BACK days.
    """
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    for days_ago in range(1, MAX_DAYS_BACK + 1):
        candidate = today - timedelta(days=days_ago)
        commits, _ = get_commits_for_date(candidate)
        if commits and commits.strip():
            print(f"Found {len(commits.split('---'))} commit(s) on {candidate.strftime('%A, %Y-%m-%d')}.")
            return commits.strip(), candidate
    return None, None


def day_label_for_prompt(target_date):
    """Human-friendly label for the prompt, e.g. 'yesterday' or 'last Friday' or 'January 20, 2026'."""
    now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    days_ago = (now - target_date.replace(hour=0, minute=0, second=0, microsecond=0)).days
    if days_ago == 1:
        return "yesterday"
    if days_ago <= 7:
        return f"last {target_date.strftime('%A')}"  # e.g. "last Friday"
    return target_date.strftime("%B %d, %Y")  # e.g. "January 20, 2026"


def theme_line_start_for_day(target_date):
    """Theme line prefix, e.g. 'Yesterday's Focus' or 'Friday's Focus'."""
    days_ago = (
        datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        - target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    ).days
    if days_ago == 1:
        return "Yesterday's Focus"
    return f"{target_date.strftime('%A')}'s Focus"  # e.g. "Friday's Focus"

def summarize_with_claude(commit_messages, day_label="yesterday", theme_line_start="Yesterday's Focus"):
    """Use Claude to create a narrative summary of the last workday's work."""
    if not ANTHROPIC_API_KEY:
        return "Error: ANTHROPIC_API_KEY not set in environment variables."
    
    if not commit_messages:
        return f"No commits found from {day_label}."
    
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    
    prompt = f"""Here are the git commit messages from {day_label}'s work on a multiplayer dating game project called "Bad Date Demo":

{commit_messages}

Create a narrative daily summary for a general (non-technical) audience. Format:

1. **Theme line**: Start with "{theme_line_start}: [Theme]" - identify the overarching goal or improvement theme (e.g., "Making the Date Feel Real", "Improving Player Experience", "Polish and Bug Fixes")

2. **Theme description**: 1-2 sentences explaining what Sean was trying to accomplish at a high level.

3. **Bulleted changes**: 4-8 bullets (combine similar changes), each formatted as:
   • **Short title** — Plain English explanation of what changed and why it matters to players

Rules:
- Write for someone who doesn't code - no technical jargon
- Focus on the player experience and why changes matter
- Each bullet should feel like "what improved" not "what code changed"
- Be concise but descriptive
- If commits mention things like "timers", "UI", "prompts", "LLM" - translate these to player-facing benefits

Example bullet style:
• **Conversations feel more natural** — The date no longer fires off questions like an interview. Instead, she reacts and shares her own stories.

Return the formatted summary."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        return f"Error calling Claude API: {e}"

def generate_changelog():
    """Main function to generate and save the changelog."""
    print(f"[{datetime.now()}] Generating daily changelog...")
    
    # Find the most recent day that had commits (walk back from yesterday)
    commits, target_date = find_most_recent_day_with_commits()
    
    if not commits or not target_date:
        print(f"No commits found in the last {MAX_DAYS_BACK} days. Skipping.")
        return
    
    date_str = target_date.strftime("%Y-%m-%d")
    day_name = target_date.strftime("%A")
    day_label = day_label_for_prompt(target_date)
    theme_line_start = theme_line_start_for_day(target_date)
    
    summary = summarize_with_claude(commits, day_label, theme_line_start)
    
    # Create the output
    output = f"""Bad Date Demo - Daily Summary
{day_name}, {target_date.strftime("%B %d, %Y")}
{'=' * 50}

{summary}

---
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
"""
    
    # Create Daily Changelog folder if it doesn't exist
    CHANGELOG_FOLDER.mkdir(exist_ok=True)
    
    # Save to Daily Changelog folder
    filename = f"changelog_{date_str}.txt"
    filepath = CHANGELOG_FOLDER / filename
    
    with open(filepath, "w") as f:
        f.write(output)
    
    print(f"Changelog saved to: {filepath}")

def run_scheduler():
    """Run the scheduler for weekday 10am execution."""
    # Schedule for weekdays at 10am
    schedule.every().monday.at("10:00").do(generate_changelog)
    schedule.every().tuesday.at("10:00").do(generate_changelog)
    schedule.every().wednesday.at("10:00").do(generate_changelog)
    schedule.every().thursday.at("10:00").do(generate_changelog)
    schedule.every().friday.at("10:00").do(generate_changelog)
    
    print("Daily Changelog Generator started!")
    print("Scheduled to run every weekday at 10:00 AM")
    print("Press Ctrl+C to stop.\n")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--now":
        # Run immediately for testing
        print("Running changelog generation now (test mode)...")
        generate_changelog()
    else:
        # Run the scheduler
        run_scheduler()
