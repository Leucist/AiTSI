import json
import datetime

def generate_report():
    with open('tests/results/unit/vitest-results.json', 'r') as f:
        vitest_data = json.load(f)

    with open('tests/results/e2e/playwright-results.json', 'r') as f:
        playwright_data = json.load(f)

    report = []
    report.append("# Raport z Wykonania Testów Automatycznych\n")
    report.append(f"**Data wygenerowania:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report.append("---\n")

    report.append("## Podsumowanie Wyników\n")
    report.append("| Rodzaj Testów | Narzędzie | Zakończone Sukcesem | Zakończone Błędem | Wszystkie |")
    report.append("|---|---|---|---|---|")

    vt_passed = vitest_data.get('numPassedTests', 0)
    vt_failed = vitest_data.get('numFailedTests', 0)
    vt_total = vitest_data.get('numTotalTests', 0)
    
    report.append(f"| Testy Jednostkowe | Vitest | [Pass] {vt_passed} | [Fail] {vt_failed} | {vt_total} |")

    pw_passed = 0
    pw_failed = 0
    pw_total = 0
    
    def count_specs(suite):
        nonlocal pw_passed, pw_failed, pw_total
        for spec in suite.get('specs', []):
            pw_total += 1
            if spec.get('ok', False):
                pw_passed += 1
            else:
                pw_failed += 1
        for sub in suite.get('suites', []):
            count_specs(sub)
            
    for suite in playwright_data.get('suites', []):
        count_specs(suite)

    report.append(f"| Testy E2E / UI | Playwright | [Pass] {pw_passed} | [Fail] {pw_failed} | {pw_total} |")
    report.append("\n---\n")

    report.append("## Szczegóły: Vitest (Testy Jednostkowe)\n")
    for tr in vitest_data.get('testResults', []):
        file_name = tr['name'].split('/')[-1]
        report.append(f"### Zestaw: `{file_name}`")
        for ar in tr.get('assertionResults', []):
            status = "[Pass]" if ar['status'] == "passed" else "[Fail]"
            title = ar['title']
            report.append(f"- {status} {title}")
        report.append("\n")

    report.append("---\n")
    report.append("## Szczegóły: Playwright (Testy E2E / UI)\n")
    
    def print_suite(suite, depth):
        prefix = "#" * (depth + 2)
        title = suite.get('title', '')
        if title:
            report.append(f"{prefix} Zestaw: `{title}`")
            
        for spec in suite.get('specs', []):
            status = "[Pass]" if spec.get('ok', False) else "[Fail]"
            spec_title = spec.get('title', '')
            report.append(f"- {status} {spec_title}")
            
        if suite.get('specs'):
            report.append("\n")
            
        for sub in suite.get('suites', []):
            print_suite(sub, depth + 1)

    for suite in playwright_data.get('suites', []):
        print_suite(suite, 1)

    with open('RAPORT_TESTOW.md', 'w') as f:
        f.write("\n".join(report))

if __name__ == "__main__":
    generate_report()
