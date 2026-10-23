# Проверки этой редакции

Дата: **2026-10-23**. Коммит публикации: `48cec2e35cce`.

Это сводка локальных проверок, а не независимая приёмка. Скрипты запускаются в рабочем проекте из
`evidence/` и в статическую копию не входят: здесь сохранены команды, результаты и границы.

## Результаты

| Проверка | Результат |
|---|---|
| guide_content_and_links | 84 PASS / 0 FAIL |
| learning_regressions | 38 PASS / 0 FAIL |
| factcheck_regressions | 36 PASS / 0 FAIL |
| print_export | 32 PASS / 0 FAIL |
| ux_refactor | 19 PASS / 0 FAIL |

## Печать (цифровой A4)

- guide_pages: 121
- answers_pages: 12
- start_pages: 4
- field_pages: 5
- worksheet_pages: 4
- training_pages: 5

## Браузер

- Chrome headless, isolated profile, CDP emulation.
- Viewport: 1360x960, 390x844, 1360x960, 1360x960.
- JS-исключений: 0; горизонтального переполнения: 0.

## Что не выполнялось

- LIVE game pass.
- beginner usability pilot.
- physical print.
- other physical device.

## Как повторяли

Из корня рабочего проекта:

```powershell
python -X utf8 -B evidence/beginners-guide-20261022/build_guide.py --report-dir evidence/ux-refactor-20261023
python -X utf8 -B evidence/beginners-guide-20261022/verify_guide.py --report-dir evidence/ux-refactor-20261023
python -X utf8 -B -c "import runpy; from pathlib import Path; runpy.run_path('evidence/beginners-guide-learning-20261022/verify_learning.py')['main'](Path('evidence/ux-refactor-20261023'))"
powershell -ExecutionPolicy Bypass -File evidence/ux-refactor-20261023/print_previews.ps1
python -X utf8 -B evidence/guide-factcheck-20261023/verify_factcheck.py
python -X utf8 -B evidence/ux-refactor-20261023/verify_ux.py
```

Полный набор прошлых проверок: `evidence/guide-factcheck-20261023/run_audit.py`.

## Граница

Automated checks confirm structure, links, arithmetic, print PDF and page bytes. They do not confirm game behaviour, human comprehension or physical printing.

**Не для реального судовождения.**
