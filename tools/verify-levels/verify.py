#!/usr/bin/env python3
"""Runs every level's code with each fix option and checks that exactly the
declared correct fix produces the expected behaviour (and the original does not).

Usage: npm run verify:levels [track ...]
Needs node, python3 (with PyYAML), bash and git. PowerShell rooms are skipped
unless a runtime is added, so review those by hand."""
import json, os, re, shutil, sqlite3, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
LEVELS = json.load(open(os.path.join(HERE, ".cache", "levels.json")))


def variants(level):
    """Yield (label, lines) for the original and each fix option."""
    yield "original", list(level["lines"])
    for fix in level["fixes"]:
        lines = list(level["lines"])
        lines[level["bugLine"]] = fix["text"]
        yield fix["id"], lines


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=20, **kw)


# ---------- JavaScript (node) ----------
JS = {
    "lobby": ('console.log(digitSum("123"));', "6"),
    "elevator": ("console.log(shouldStop(3, 5), shouldStop(4, 4));", "false true"),
    "vault": ('console.log(JSON.stringify(countCodes(["a","b","a"])));', '{"a":2,"b":1}'),
    "server-room": ('const fetchFresh=()=>"fresh"; console.log(readCache({a:0},"a"), readCache({},"b"));', "0 fresh"),
    "security-desk": ('const page=(g)=>Promise.resolve("ok-"+g); pageGuards(["a","b"]).then(r=>console.log(JSON.stringify(r)));', '["ok-a","ok-b"]'),
    "archive": ("console.log(makeCounters().map(f=>f()).join());", "0,1,2"),
    "mailroom": ("const s=[10,9,1]; const r=sortScores(s); console.log(JSON.stringify(r), JSON.stringify(s));", "[1,9,10] [10,9,1]"),
    "last-item": ("console.log(last([1,2,3]));", "3"),
    "form-total": ('console.log(total("2","3"));', "5"),
    "timer-room": ("counter.start(); setTimeout(()=>console.log(counter.count), 30);", "1"),
    "guest-list": ('console.log(hasUser([{name:"a"}],"a"));', "true"),
    "till-check": ("console.log(isTotalCorrect(0.1,0.2,0.3));", "true"),
    "rooftop": ('const u={name:"x",tags:["a"]}; const r=addTag(u,"b"); console.log(JSON.stringify(u.tags), JSON.stringify(r.tags));', '["a"] ["a","b"]'),
}


def check_js(level, lines):
    suffix, expected = JS[level["id"]]
    src = "\n".join(lines) + "\n" + suffix
    r = run(["node", "-e", src])
    return r.stdout.strip() == expected, (r.stdout + r.stderr).strip()[:80]


# ---------- Python ----------
PY = {
    "py-lobby": ("print(total([1,2,3]))", "6"),
    "py-strings": ("", "Age: 30"),
    "py-guard": ('print(is_admin("".join(["ad","min"])), is_admin("a"))', "True False"),
    "py-ledger": ("print(average([1,2]))", "1.5"),
    "py-counter": ('print(count_words(["a","b","a"]))', "{'a': 2, 'b': 1}"),
    "py-vault": ("print(remove_evens([2,4,6,8]))", "[]"),
    "py-closure": ("", "[0, 1, 2]"),
    "py-first-even": ("print(first_even([1,3,2]), first_even([1,3]))", "2 None"),
    "py-alias": ("", "[1, 2, 3]"),
    "py-immutable": ("", "Jello"),
    "py-class-var": ("a = Cart(); b = Cart(); a.add(1); print(a.items, b.items)", "[1] []"),
    "py-generator": ("", "14\n14"),
}


def check_py(level, lines):
    suffix, expected = PY[level["id"]]
    src = "\n".join(lines) + "\n" + suffix
    r = run([sys.executable, "-W", "ignore", "-c", src])
    return r.stdout.strip() == expected, (r.stdout + r.stderr).strip()[-80:]


# ---------- Bash ----------
def check_bash(level, lines):
    lid = level["id"]
    d = tempfile.mkdtemp()
    try:
        def script(name, body):
            p = os.path.join(d, name)
            open(p, "w").write(body)
            os.chmod(p, 0o755)
            return p
        text = "\n".join(lines) + "\n"
        if lid == "au-spaces":
            r = run(["bash", script("s.sh", text)])
            return r.stdout.strip() == "Hello, Dana", (r.stdout + r.stderr).strip()[:80]
        if lid == "au-quote":
            open(os.path.join(d, "my report.txt"), "w").write("REPORT\n")
            r = run(["bash", script("s.sh", text)], cwd=d)
            return r.stdout.strip() == "REPORT", (r.stdout + r.stderr).strip()[:80]
        if lid == "au-exit":
            results = []
            for build_ok in (False, True):
                marker = os.path.join(d, "deployed")
                if os.path.exists(marker):
                    os.remove(marker)
                script("build.sh", "#!/bin/bash\n" + ("exit 0\n" if build_ok else "exit 1\n"))
                script("deploy.sh", f"#!/bin/bash\ntouch {marker}\n")
                run(["bash", script("release.sh", text)], cwd=d)
                # deploy must happen only when the build succeeded
                time_wait = 0.2
                import time; time.sleep(time_wait)
                results.append(os.path.exists(marker) == build_ok)
            return all(results), f"fail->no deploy:{results[0]} ok->deploy:{results[1]}"
        if lid == "au-test":
            p = script("check.sh", text)
            r0 = run(["bash", p])
            r1 = run(["bash", p, "ok"])
            good = r0.stderr.strip() == "" and r1.stdout.strip() == "All good"
            return good, (r0.stderr + r1.stdout + r1.stderr).strip()[:80]
        if lid == "au-return":
            r = run(["bash", script("f.sh", text)])
            return r.stdout.strip() == "5", (r.stdout + r.stderr).strip()[:80]
        if lid == "au-brackets":
            outs = []
            for n in ("5", "2"):
                r = run(["bash", script("c.sh", text.replace("count=5", f"count={n}"))], cwd=d)
                outs.append(r.stdout.strip())
            return outs == ["big", ""], f"count=5 -> {outs[0]!r}, count=2 -> {outs[1]!r}"
        if lid == "au-streq":
            r = run(["bash", script("l.sh", text)])
            return r.stdout.strip() == "Welcome" and r.stderr.strip() == "", (r.stdout + r.stderr).strip()[:80]
        if lid == "au-redirect":
            open(os.path.join(d, "marker.txt"), "w").write("x")
            run(["bash", script("l.sh", text)], cwd=d)
            out = open(os.path.join(d, "out.txt")).read() if os.path.exists(os.path.join(d, "out.txt")) else ""
            return "No such file" in out and "marker.txt" in out, f"error captured:{'No such file' in out} listing captured:{'marker.txt' in out}"
        if lid == "au-sete":
            open(os.path.join(d, "app.log"), "w").write("all good\n")
            r = run(["bash", script("s.sh", text)], cwd=d)
            return r.stdout.strip() == "Scan finished", (r.stdout + r.stderr).strip()[:60] or "(no output)"
        if lid == "au-cron":
            line = lines[level["bugLine"]].split()
            m, h, dom, mon, dow = line[:5]
            ok = m == "30" and h == "2" and dom == "*" and mon == "*" and dow == "*" and 0 <= int(h) <= 23
            return ok, " ".join(line[:5])
        if lid == "au-percent":
            line = lines[level["bugLine"]]
            # cron treats every unescaped % as a newline, even inside quotes
            ok = all(i > 0 and line[i - 1] == "\\" for i, c in enumerate(line) if c == "%")
            return ok, "unescaped % present" if not ok else "all % escaped"
        if lid == "au-yaml":
            import yaml
            doc = yaml.safe_load(text)
            steps = doc["jobs"]["test"]["steps"]
            ok = all(isinstance(s, dict) and ("run" in s or "uses" in s) for s in steps)
            return ok, str(steps)[-70:]
    finally:
        shutil.rmtree(d, ignore_errors=True)
    raise KeyError(lid)


# ---------- SQL (sqlite) ----------
SQL_SETUP = """
CREATE TABLE employees(id INTEGER, name TEXT, dept TEXT, salary INTEGER, manager_id INTEGER);
INSERT INTO employees VALUES (1,'Ann','Sales',6000,NULL),(2,'Bo','Sales',5000,1),(3,'Cy','Support',7000,1),(4,'Di','Support',4000,3),(5,'Ed','Sales',4500,1);
CREATE TABLE customers(id INTEGER, name TEXT);
INSERT INTO customers VALUES (1,'Ann'),(2,'Bo'),(3,'Cy');
CREATE TABLE orders(id INTEGER, customer_id INTEGER, total INTEGER, status TEXT, created_at TEXT);
INSERT INTO orders VALUES (1,1,50,'shipped','2024-01-05 10:00:00'),(2,1,20,'shipped','2024-01-31 15:00:00'),(3,2,30,'pending','2024-02-01 00:00:00'),(4,NULL,10,'pending','2024-01-10 09:00:00'),(5,2,15,'shipped','2024-01-31 23:59:30');
CREATE TABLE scores(student TEXT, points INTEGER);
INSERT INTO scores VALUES ('a',10),('b',NULL),('c',20);
CREATE TABLE results(student TEXT, passed INTEGER);
INSERT INTO results VALUES ('a',1),('b',0),('c',1),('d',1);
"""
SQL = {
    "sql-null": {("Ann",)},
    "sql-order": [("Cy", 7000), ("Ann", 6000), ("Bo", 5000)],
    "sql-having": {("Sales", 3)},
    "sql-distinct": [(2,)],
    "sql-intdiv": [(0.75,)],
    "sql-or": {("Ann",), ("Cy",)},
    "sql-not-in": {("Cy",)},
    "sql-between": [(4,)],
    "sql-like": {("Ann",)},
    "sql-and": {("Ann",), ("Bo",), ("Cy",), ("Di",), ("Ed",)},
    "sql-avg": [(10.0,)],
    "sql-subquery": {("Ann",), ("Cy",)},
}


def check_sql(level, lines):
    con = sqlite3.connect(":memory:")
    con.executescript(SQL_SETUP)
    try:
        rows = con.execute("\n".join(lines)).fetchall()
    except Exception as e:
        return False, f"error: {e}"[:80]
    expected = SQL[level["id"]]
    got = set(rows) if isinstance(expected, set) else rows
    return got == expected, str(rows)[:80]


# ---------- Git ----------
def git(d, *args, check=False):
    env = dict(os.environ, GIT_EDITOR="true", GIT_AUTHOR_NAME="T", GIT_AUTHOR_EMAIL="t@t", GIT_COMMITTER_NAME="T", GIT_COMMITTER_EMAIL="t@t", GIT_CONFIG_GLOBAL="/dev/null", GIT_CONFIG_SYSTEM="/dev/null")
    return subprocess.run(["git", *args], cwd=d, capture_output=True, text=True, env=env)


def sh(d, cmd):
    env = dict(os.environ, GIT_EDITOR="true", GIT_AUTHOR_NAME="T", GIT_AUTHOR_EMAIL="t@t", GIT_COMMITTER_NAME="T", GIT_COMMITTER_EMAIL="t@t", GIT_CONFIG_GLOBAL="/dev/null", GIT_CONFIG_SYSTEM="/dev/null")
    return subprocess.run(["bash", "-c", cmd], cwd=d, capture_output=True, text=True, env=env)


def init_repo(d):
    git(d, "init", "-q", "-b", "main")
    open(os.path.join(d, "a.txt"), "w").write("one\n")
    git(d, "add", "a.txt"); git(d, "commit", "-q", "-m", "first")


def check_git(level, lines):
    lid = level["id"]
    d = tempfile.mkdtemp()
    try:
        cmds = [l for l in lines if not l.startswith("#")]
        if lid == "git-add":
            run_cmds = "\n".join(cmds)
            sh(d, run_cmds)
            tree = git(d, "ls-tree", "-r", "HEAD").stdout
            return "notes.txt" in tree, tree.strip()[:60] or "no commit"
        if lid == "git-restore":
            init_repo(d)
            open(os.path.join(d, "secret.txt"), "w").write("pw\n")
            git(d, "add", "secret.txt")
            r = sh(d, "\n".join(cmds))
            exists = os.path.exists(os.path.join(d, "secret.txt"))
            staged = git(d, "diff", "--cached", "--name-only").stdout.strip()
            return exists and staged == "", f"file kept:{exists} staged:{staged!r} {r.stderr.strip()[:40]}"
        if lid == "git-branch":
            init_repo(d)
            open(os.path.join(d, "a.txt"), "a").write("two\n")
            git(d, "add", "a.txt")
            sh(d, "\n".join(cmds))
            head = git(d, "rev-parse", "--abbrev-ref", "HEAD").stdout.strip()
            main_count = git(d, "rev-list", "--count", "main").stdout.strip()
            return head == "feature" and main_count == "1", f"HEAD={head} main commits={main_count}"
        if lid == "git-reset":
            init_repo(d)
            open(os.path.join(d, "a.txt"), "a").write("two\n")
            git(d, "commit", "-q", "-am", "Oops, wrong message")
            sh(d, "\n".join(cmds[1:]))  # the first command is the commit already made
            count = git(d, "rev-list", "--count", "HEAD").stdout.strip()
            content = open(os.path.join(d, "a.txt")).read() if os.path.exists(os.path.join(d, "a.txt")) else ""
            return count == "1" and "two" in content, f"commits={count} has-change={'two' in content}"
        if lid == "git-stash":
            init_repo(d)
            open(os.path.join(d, "notes.txt"), "w").write("new\n")
            sh(d, "\n".join(cmds))
            gone = not os.path.exists(os.path.join(d, "notes.txt"))
            stashes = git(d, "stash", "list").stdout.strip()
            return gone and stashes != "", f"notes gone:{gone} stash entries:{len(stashes.splitlines())}"
        if lid == "git-quotes":
            init_repo(d)
            open(os.path.join(d, "notes.txt"), "w").write("tpyo\n")
            sh(d, "\n".join(cmds))
            msg = git(d, "log", "-1", "--format=%s").stdout.strip()
            return msg == "Fix typo in notes", f"last commit: {msg!r}"
        if lid == "git-discard":
            init_repo(d)
            open(os.path.join(d, "app.txt"), "w").write("v1\n")
            git(d, "add", "app.txt"); git(d, "commit", "-q", "-m", "app")
            open(os.path.join(d, "app.txt"), "w").write("edited\n")
            sh(d, "\n".join(cmds))
            content = open(os.path.join(d, "app.txt")).read().strip()
            return content == "v1", f"app.txt = {content!r}"
        if lid == "git-amend":
            init_repo(d)
            open(os.path.join(d, "a.txt"), "a").write("feature\n")
            git(d, "add", "a.txt")
            sh(d, "\n".join(cmds))
            count = git(d, "rev-list", "--count", "HEAD").stdout.strip()
            msg = git(d, "log", "-1", "--format=%s").stdout.strip()
            return count == "2" and msg == "Add feature", f"commits={count} last={msg!r}"
        if lid == "git-force-lease":
            results = []
            for teammate_pushed in (False, True):
                base = tempfile.mkdtemp()
                try:
                    remote = os.path.join(base, "remote.git"); me = os.path.join(base, "me"); mate = os.path.join(base, "mate")
                    git(base, "init", "-q", "--bare", "-b", "main", remote)
                    git(base, "clone", "-q", remote, me)
                    open(os.path.join(me, "a.txt"), "w").write("one\n")
                    git(me, "add", "a.txt"); git(me, "commit", "-q", "-m", "X")
                    git(me, "push", "-q", "-u", "origin", "main")
                    git(base, "clone", "-q", remote, mate)
                    git(me, "commit", "-q", "--amend", "-m", "X amended")
                    if teammate_pushed:
                        open(os.path.join(mate, "b.txt"), "w").write("t\n")
                        git(mate, "add", "b.txt"); git(mate, "commit", "-q", "-m", "T")
                        git(mate, "push", "-q", "origin", "main")
                    sh(me, "\n".join(cmds))
                    head = git(remote, "log", "-1", "--format=%s", "main").stdout.strip()
                    results.append(head == ("T" if teammate_pushed else "X amended"))
                finally:
                    shutil.rmtree(base, ignore_errors=True)
            return all(results), f"clean push ok:{results[0]} teammate protected:{results[1]}"
        if lid == "git-cherry-pick":
            init_repo(d)
            git(d, "switch", "-q", "-c", "feature")
            hashes = []
            for name in ("f1.txt", "f2.txt", "f3.txt"):
                open(os.path.join(d, name), "w").write("x\n")
                git(d, "add", name); git(d, "commit", "-q", "-m", name)
                hashes.append(git(d, "rev-parse", "HEAD").stdout.strip())
            git(d, "switch", "-q", "main")
            sh(d, "\n".join(c.replace("a1b2c3d", hashes[1]) for c in cmds))
            has2 = os.path.exists(os.path.join(d, "f2.txt")); has1 = os.path.exists(os.path.join(d, "f1.txt"))
            return has2 and not has1, f"f2 present:{has2} f1 absent:{not has1}"
        if lid == "git-detached":
            init_repo(d)
            open(os.path.join(d, "other.txt"), "w").write("x\n")
            git(d, "add", "other.txt"); git(d, "commit", "-q", "-m", "second")
            first = git(d, "rev-parse", "HEAD~1").stdout.strip()
            open(os.path.join(d, "a.txt"), "a").write("fix\n")
            script = "\n".join(c.replace("a1b2c3d", first) for c in cmds)
            sh(d, script)
            found = git(d, "log", "--all", "--oneline", "--grep=Quick fix").stdout.strip()
            return found != "", "commit reachable" if found else "commit orphaned"
        if lid == "git-revert-merge":
            init_repo(d)
            git(d, "switch", "-q", "-c", "feature")
            open(os.path.join(d, "feature.txt"), "w").write("f\n")
            git(d, "add", "."); git(d, "commit", "-q", "-m", "feature work")
            git(d, "switch", "-q", "main")
            open(os.path.join(d, "main.txt"), "w").write("m\n")
            git(d, "add", "."); git(d, "commit", "-q", "-m", "main work")
            git(d, "merge", "-q", "--no-ff", "feature", "-m", "Merge feature")
            merge = git(d, "rev-parse", "HEAD").stdout.strip()
            script = "\n".join(c.replace("8f3c2a1", merge) for c in cmds)
            r = sh(d, script)
            gone = not os.path.exists(os.path.join(d, "feature.txt"))
            return gone and r.returncode == 0, f"feature.txt gone:{gone} rc={r.returncode} {r.stderr.strip()[:40]}"
    finally:
        shutil.rmtree(d, ignore_errors=True)
    raise KeyError(lid)


CHECKERS = {
    "javascript": check_js,
    "python": check_py,
    "automation": check_bash,
    "sql": check_sql,
    "git": check_git,
}


def main():
    only = set(sys.argv[1:])
    problems = 0
    for track, levels in LEVELS.items():
        if only and track not in only:
            continue
        if track not in CHECKERS:
            print(f"== {track}: SKIPPED (no runtime available here)")
            continue
        print(f"== {track}")
        for level in levels:
            outcome = {}
            for label, lines in variants(level):
                try:
                    outcome[label] = check_fn(track)(level, lines)
                except KeyError:
                    outcome[label] = (None, "no checker")
            correct = level["correctFixId"]
            passing = [k for k, v in outcome.items() if v[0]]
            ok = passing == [correct]
            problems += 0 if ok else 1
            flag = "OK " if ok else "BAD"
            print(f"  {flag} {level['id']:<14} passing={passing} expected=['{correct}']")
            if not ok:
                for k, v in outcome.items():
                    print(f"       {k}: {v}")
    print(f"\nproblems: {problems}")
    return problems


def check_fn(track):
    return CHECKERS[track]


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
