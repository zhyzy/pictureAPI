import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-CN">
        <Head>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          {/* 首帧前同步应用主题，避免先渲染默认主题再跳变 */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('site_theme');if(!t||t==='default')t='nature';document.documentElement.setAttribute('data-theme',t);var d=localStorage.getItem('theme');if(d==='dark'||(!d&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
            }}
          />
          {/* 字体改为自托管（见 _app.tsx 中 fontsource 导入），不再引用 Google Fonts */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
