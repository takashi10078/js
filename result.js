// サイトにアクセスした瞬間に結果を計算して表示（無名関数を利用）
window.addEventListener("DOMContentLoaded", () => { // DOMContentLoaded（ドム・コンテンツ・ローデッド）とは、ブラウザがHTMLの読み込みと解析（パース）を完了し、DOMツリーの構築がすべて終わった時点で発火するJavaScriptのイベント
  try {
    // ローカルストレージにデータがあるか確認
    const hasData = localStorage.getItem("active");

    if (hasData === null) { // まだ診断していない場合
      const noResultTarget = document.getElementById("noResult"); // htmlのnoResultを取得
      if (noResultTarget) {
        noResultTarget.innerText = "まだ結果はありません"; // 画面表示
      }
      return; // ここで処理を終了
    }

    // データがある場合の処理
    // main.jsでlocalStorageに保存した値を取得
    let active = Number(localStorage.getItem("active"));
    let care = Number(localStorage.getItem("care"));
    let stable = Number(localStorage.getItem("stable"));
    let depend = Number(localStorage.getItem("depend"));

    // 先に変数の宣言
    let resultText = "";
    let resultDesc = ""; 
    let max = Math.max(active, care, stable, depend); // 最大のスコアを取得

    // 最大スコアに応じて表示テキストを決定
    if (max === active) {
    resultText = '<img src="./img/sekyoku.png" class="resultImg">';

    resultDesc = `
      <h3>特徴</h3>
      <p>恋愛では自分から行動できるタイプ。チャンスを逃しにくい性格です。</p>

      <h3>気を付けること</h3>
      <p>勢いが強すぎると相手のペースを乱してしまうことがあります。</p>

      <h3>恋愛アドバイス</h3>
      <p>相手の気持ちも尊重するとさらに魅力的になります。</p>`;
    } else if (max === care) {
      resultText = '<img src="./img/omoiyari.png" class="resultImg">';

      resultDesc = `
        <h3>特徴</h3>
        <p>相手の気持ちを大切にできる優しい恋愛タイプ。</p>

        <h3>気を付けること</h3>
        <p>相手に合わせすぎて自分が疲れてしまうことがあります。</p>

        <h3>恋愛アドバイス</h3>
        <p>自分の気持ちも大切にすることで関係が長続きします。</p>`;
    } else if (max === stable) {
      resultText = '<img src="./img/antei.png" class="resultImg">';

      resultDesc = `
        <h3>特徴</h3>
        <p>落ち着いた恋愛を好む安心感のあるタイプ。</p>

        <h3>気を付けること</h3>
        <p>慎重すぎるとチャンスを逃すことがあります。</p>

        <h3>恋愛アドバイス</h3>
        <p>少し勇気を出すことで恋愛が大きく進みます。</p>`;
    } else {
      resultText = '<img src="./img/sintyo.png" class="resultImg">';

      resultDesc = `
        <h3>特徴</h3>
        <p>相手をよく観察してから行動する慎重な恋愛タイプ。</p>

        <h3>気を付けること</h3>
        <p>考えすぎて行動できなくなることがあります。</p>

        <h3>恋愛アドバイス</h3>
        <p>小さな行動から始めると恋愛が進みやすくなります。</p><br>`;
    }

    const resultTarget = document.getElementById("result"); // result.htmlのresultを取得
    if (resultTarget) {
      // resultTextとresultDescを結合してhtmlに表示
      resultTarget.innerHTML = resultText + resultDesc; 
    } else {
      throw new Error("Textが見つかりません"); // エラー表示
    }

  } catch (error) {
    console.error("Error:", error); // エラー表示
  }
});