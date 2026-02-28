## React＋Viteプロジェクトの作成手順
新規プロジェクトは以下の手順で作成します。

### React作成コマンドを実行
以下のコマンドを任意のフォルダで実行します。

```
npm create vite@latest . -- --template react-ts
```

次の質問がされるので、以下のように回答します。

```
Package name:
→任意のパッケージ名

Use Vite 8 beta (Experimental)?:
→No

Install with npm and start now?
→Yes
```

以下のような表示が出たら作成完了。

```
◇  Scaffolding project in /xxxx/xxxx/xxxx/xxxx/replace_wo_demo/wo_copyButton...
│
◇  Installing dependencies with npm...

added 177 packages, and audited 178 packages in 8s

46 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
│
◇  Starting dev server...

> wo-copybutton@0.0.0 dev
> vite


  VITE v7.3.1  ready in 328 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

```

### 注意点
新規作成時にviteのバージョンは指定できないため、package.jsonを複製して作成するように。