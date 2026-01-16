## Reactプロジェクトの作成

以下のコマンドを任意のフォルダに実行する。

```bash
npm create vite@latest timesheet -- --template react-ts
```

実行して質問される以下の内容はどちらとも No で問題ない。

Use rolldown-vite (Experimental)?
→ No

Install with npm and start now?
→ No

プロジェクトが作成できたら、以下のコマンドでライブラリをインストールする。

```bash
npm install
```

ライブラリの用意ができたら以下のコマンドで実行できるか確認する。

```bash
npm run dev
```

ついでに、index.html の言語を ja にしておく。

```html
<html lang="ja">
```

準備ができたら、必要なライブラリをインストールする。以下のコマンド実行で可能。

```bash
npm install \
  @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction \
  @fullcalendar/react @fullcalendar/timegrid \
  @tanstack/react-query \
  i18next react-i18next react-icons \
  react-datepicker ress
```