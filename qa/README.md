# Проверки рабочей редакции

- Время записи (UTC): `2026-10-23T17:42:46.657488+00:00`
- Сводный SHA-256 проверенного дерева `lessons-site/`: `408bb02c2a625fa6…` (103 файлов в `checks.json`)
- Предыдущий базовый коммит в репозитории публикации до синхронизации: `9fe911a8c947`

Результаты ниже привязаны к фактическим SHA-256 файлов текущей редакции в `qa/checks.json`, а не к старому коммиту.

## Сводка проверок (PASS / FAIL / NOT RUN)

| Проверка | Статус | Подробности |
|---|---|---|
| Структура, ссылки и сохранность GUIDE | **PASS** | 86 PASS / 0 FAIL |
| Численные и учебные регрессии | **PASS** | 38 PASS / 0 FAIL |
| Поставка Б (П1–П6, схемы F II/LOP, мутации ключей) | **PASS** | 17 PASS / 0 FAIL |
| Цифровой экспорт A4 | **PASS** | 5 PASS / 0 FAIL |
| Браузер (CDP + негативные пробы) | **PASS** | 13 экранов, 3 негативных отказа, макс. переполнение 0 px |
| Переносимая проверка статической копии (`qa/verify_site.py`) | **PASS** | 6 PASS / 0 FAIL |
| Бумажный пилот с новичком | **NOT RUN** | Протокол готов; нужен участник без знакомства с курсом |
| Игровая приёмка урока 1 (LIVE) | **NOT RUN** | Требуются отдельное разрешение, оператор, участник и backup/rollback |
| Физическая печать и физический телефон | **NOT RUN** | Проверены цифровой A4 и эмуляция 390×844 |

## Цифровой A4 (страниц)

- `guide_pages`: **131**
- `basics_pages`: **9**
- `training_pages`: **8**
- `answers_pages`: **16**
- `start_pages`: **5**
- `field_pages`: **5**
- `worksheet_pages`: **4**
- `starter_worksheet_pages`: **1**
- `embedded_image_uses`: **41**

## Как запустить переносимую проверку из копии сайта

Этот скрипт входит прямо в опубликованную копию `qa/verify_site.py` и требует только стандартный Python 3:

```powershell
python -X utf8 -B qa/verify_site.py
```

Он проверяет наличие всех страниц, `lang="ru"`, `viewport`, уникальность `id`, все локальные ссылки и межстраничные `#якоря`, размеры PNG, отсутствие утечки ответов в учебные страницы и SHA-256 трёх исходных PDF в `source-tables/`.

## Как повторить полную локальную сборку и браузерные прогоны в рабочем проекте

Полные регрессии (с пересчётом эфемерид, экспортом PDF через Chrome и мутационными проверками) выполняются из корня рабочего проекта:

```powershell
python -X utf8 -B evidence/learning-stages-20261023/draw_stages.py
python -X utf8 -B evidence/beginners-guide-20261022/build_guide.py --report-dir evidence/learning-stages-20261023
node evidence/learning-stages-20261023/preview_checks.mjs
powershell -ExecutionPolicy Bypass -File evidence/learning-stages-20261023/print_previews.ps1
python -X utf8 -B evidence/beginners-guide-20261022/verify_guide.py --report-dir evidence/learning-stages-20261023
python -X utf8 -B -c "import runpy; from pathlib import Path; runpy.run_path('evidence/beginners-guide-learning-20261022/verify_learning.py')['main'](Path('evidence/learning-stages-20261023'))"
python -X utf8 -B evidence/learning-stages-20261023/verify_stages.py
python -X utf8 -B evidence/learning-stages-20261023/publish_qa.py
```

## Граница

Portable checks in qa/verify_site.py verify HTML structure, links, image dimensions, answer separation and source-table PDF hashes directly from this site copy. Full ephem/audit/CDP scripts run in the workspace evidence/ directory. Technical checks do not prove human comprehension, physical print or live game behaviour.

**Не для реального судовождения.**
