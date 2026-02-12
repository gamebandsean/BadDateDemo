#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Memory skill helper script for persistent key-value storage.

Usage:
    memory.py store <namespace> <key> <value>
    memory.py get <namespace> <key>
    memory.py delete <namespace> <key>
    memory.py list <namespace>
    memory.py list-all
    memory.py clear <namespace>
    memory.py exists <namespace> <key>
    memory.py keys <namespace> [--pattern=<glob>]
"""

import json
import os
import sys
import fnmatch
from pathlib import Path


def get_project_root() -> Path:
    """Find project root by looking for .cursor, .claude, or .git directory."""
    current = Path.cwd()
    while current != current.parent:
        if (current / ".cursor").exists() or (current / ".claude").exists() or (current / ".git").exists():
            return current
        current = current.parent
    return Path.cwd()


def get_memory_dir() -> Path:
    """Get the memory storage directory, creating if needed.

    Storage location: <project_root>/data/memory/
    This shared data folder can be used by other tools/agents/skills
    and can be selectively versioned via .gitignore patterns.
    """
    project_root = get_project_root()
    memory_dir = project_root / "data" / "memory"
    memory_dir.mkdir(parents=True, exist_ok=True)
    return memory_dir


def sanitize_namespace(namespace: str) -> str:
    """Sanitize namespace to prevent path traversal attacks."""
    # Remove any path separators and dangerous characters
    sanitized = namespace.replace("/", "_").replace("\\", "_").replace("..", "_")
    # Also handle cases where someone tries to use just "."
    sanitized = sanitized.strip(".")
    if not sanitized:
        raise ValueError("Invalid namespace: namespace cannot be empty or consist only of dots")
    return sanitized


def get_namespace_file(namespace: str) -> Path:
    """Get the JSON file path for a namespace."""
    safe_namespace = sanitize_namespace(namespace)
    filepath = get_memory_dir() / f"{safe_namespace}.json"
    # Extra safety: ensure the resolved path is inside the memory directory
    memory_dir = get_memory_dir()
    if not filepath.resolve().is_relative_to(memory_dir.resolve()):
        raise ValueError(f"Invalid namespace: path traversal detected")
    return filepath


def load_namespace(namespace: str) -> dict:
    """Load data from a namespace file."""
    filepath = get_namespace_file(namespace)
    if not filepath.exists():
        return {}
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        # Backup corrupted file
        backup = filepath.with_suffix(".json.bak")
        filepath.rename(backup)
        print(f"Warning: Corrupted file backed up to {backup.name}", file=sys.stderr)
        return {}


def save_namespace(namespace: str, data: dict) -> None:
    """Save data to a namespace file."""
    filepath = get_namespace_file(namespace)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def parse_value(value_str: str):
    """Parse a value string, attempting JSON parse first."""
    try:
        return json.loads(value_str)
    except json.JSONDecodeError:
        return value_str


def cmd_store(namespace: str, key: str, value: str) -> None:
    """Store a value in a namespace."""
    data = load_namespace(namespace)
    data[key] = parse_value(value)
    save_namespace(namespace, data)
    print(f'Stored "{key}" in {namespace}')


def cmd_get(namespace: str, key: str) -> None:
    """Retrieve a value from a namespace."""
    data = load_namespace(namespace)
    if key not in data:
        print(f'Key "{key}" not found in {namespace}', file=sys.stderr)
        sys.exit(1)

    value = data[key]
    if isinstance(value, (dict, list)):
        print(json.dumps(value, indent=2, ensure_ascii=False))
    else:
        print(value)


def cmd_delete(namespace: str, key: str) -> None:
    """Delete a key from a namespace."""
    data = load_namespace(namespace)
    if key not in data:
        print(f'Key "{key}" not found in {namespace}', file=sys.stderr)
        sys.exit(1)

    del data[key]
    save_namespace(namespace, data)
    print(f'Deleted "{key}" from {namespace}')


def cmd_list(namespace: str) -> None:
    """List all keys in a namespace."""
    filepath = get_namespace_file(namespace)
    if not filepath.exists():
        print(f'Namespace "{namespace}" does not exist', file=sys.stderr)
        sys.exit(1)

    data = load_namespace(namespace)
    if not data:
        print(f"No keys in {namespace}")
        return

    print(f"Keys in {namespace}:")
    for key in sorted(data.keys()):
        print(f"  - {key}")


def cmd_list_all() -> None:
    """List all namespaces."""
    memory_dir = get_memory_dir()
    namespaces = sorted([f.stem for f in memory_dir.glob("*.json")])

    if not namespaces:
        print("No namespaces found")
        return

    print("Namespaces:")
    for ns in namespaces:
        print(f"  - {ns}")


def cmd_clear(namespace: str) -> None:
    """Clear all data in a namespace."""
    filepath = get_namespace_file(namespace)
    if not filepath.exists():
        print(f'Namespace "{namespace}" does not exist', file=sys.stderr)
        sys.exit(1)

    filepath.unlink()
    print(f"Cleared namespace {namespace}")


def cmd_exists(namespace: str, key: str) -> None:
    """Check if a key exists in a namespace."""
    data = load_namespace(namespace)
    if key in data:
        print("true")
    else:
        print("false")
        sys.exit(1)


def cmd_keys(namespace: str, pattern: str = None) -> None:
    """List keys in a namespace, optionally filtered by glob pattern."""
    filepath = get_namespace_file(namespace)
    if not filepath.exists():
        print(f'Namespace "{namespace}" does not exist', file=sys.stderr)
        sys.exit(1)

    data = load_namespace(namespace)
    keys = sorted(data.keys())

    if pattern:
        keys = [k for k in keys if fnmatch.fnmatch(k, pattern)]

    for key in keys:
        print(key)


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
        if cmd == "store":
            if len(args) < 3:
                print("Usage: memory.py store <namespace> <key> <value>", file=sys.stderr)
                sys.exit(1)
            namespace, key = args[0], args[1]
            value = " ".join(args[2:])  # Allow multi-word values
            cmd_store(namespace, key, value)

        elif cmd == "get":
            if len(args) != 2:
                print("Usage: memory.py get <namespace> <key>", file=sys.stderr)
                sys.exit(1)
            cmd_get(args[0], args[1])

        elif cmd == "delete":
            if len(args) != 2:
                print("Usage: memory.py delete <namespace> <key>", file=sys.stderr)
                sys.exit(1)
            cmd_delete(args[0], args[1])

        elif cmd == "list":
            if len(args) != 1:
                print("Usage: memory.py list <namespace>", file=sys.stderr)
                sys.exit(1)
            cmd_list(args[0])

        elif cmd == "list-all":
            cmd_list_all()

        elif cmd == "clear":
            if len(args) != 1:
                print("Usage: memory.py clear <namespace>", file=sys.stderr)
                sys.exit(1)
            cmd_clear(args[0])

        elif cmd == "exists":
            if len(args) != 2:
                print("Usage: memory.py exists <namespace> <key>", file=sys.stderr)
                sys.exit(1)
            cmd_exists(args[0], args[1])

        elif cmd == "keys":
            if len(args) < 1:
                print("Usage: memory.py keys <namespace> [pattern]", file=sys.stderr)
                sys.exit(1)
            pattern = args[1] if len(args) > 1 else None
            cmd_keys(args[0], pattern)

        else:
            print(f"Unknown command: {cmd}", file=sys.stderr)
            print_usage()

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
