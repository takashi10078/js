// htmlの要素取得
const form = document.getElementById("sindanForm"); // index.htmlのフォーム
const questions = document.getElementById("questions"); // 質問
const submitBlock = document.getElementById("submitBlock"); // 診断ボタン

// jsonファイル取得 Ajax使用
async function loadQuestions() {
  try { // 例外処理
    const response = await fetch('./questions.json'); // jsonファイルの読み込み
    
    if (response.ok == false) { // .okはHTTPステータスコードが200~299の範囲のときにtrueになるex)404エラーはfalse
      throw new Error('JSONファイルの読み込みに失敗しました'); // エラー表示
    }

    const data = await response.json(); // jsonファイルから送られてきたよくわからないデータをawait（解析するから少し待っていて）

    // 読み込んだデータを元にHTML要素を生成
    for(const q of data) { // jsonファイルの一つ一つの要素を取り出す
      const pTag = document.createElement("p"); // htmlのpタグを作成
      pTag.innerHTML = `${q.text}<br>`; // jsonファイルの一つの要素の質問文（text）を呼び出し表示

      let i = 0; // ループ用の変数を定義
      for(const opt of q.options) { // 外側のループで取得した一つの要素のoptionsを取得
        const label = document.createElement("label"); // htmlのラベルを作成
        const input = document.createElement("input"); // htmlのinputを作成
        input.type = "radio"; // ラジオボタン作成
        input.name = `q${q.id}`; //jsonファイルのidをinputのname属性に入力
        input.value = opt.value; //jsonファイルのvalueをinputのvalue属性に入力
        
        if (i === 0) {
          input.required = true; // どれか一つを選択しないとエラー表示
        }

        label.appendChild(input); // ラベルの中にラジオボタンを入れる<label><input type="radio"></label>
        label.appendChild(document.createTextNode(` ${opt.text}`)); // 選択肢を追加する
        pTag.appendChild(label); // 質問文の入ったpTagに追加する
      };

      questions.appendChild(pTag); // 最後にすべてをhtmlに表示する
    };

    if (submitBlock) {
      submitBlock.style.display = "block"; // もし診断ボタンがあるなら表示してください(htmlで診断ボタンを非表示にしているから)
    }

  } catch (error) {
    console.error('Error:', error); // エラー表示
    questions.innerHTML = '<p style="color:red;">質問の読み込み中にエラーが発生しました。</p>'; //エラーメッセージ
  }
}

// 結果計算
if(form){
  form.addEventListener("submit", (e) => { // (e)イベント処理 診断ボタンを押したとき
    e.preventDefault(); // 計算をするのでいったんresult.htmlに飛ばすのをやめる

    //結果項目の変数定義
    let active = 0;
    let care = 0;
    let stable = 0;
    let depend = 0;

    for(let i = 1; i <= 20; i++){ // 質問を1から20までループ
      let selected = document.querySelector(`input[name="q${i}"]:checked`); // 質問番号を取得
      if(!selected) continue; // もし選択されていなかったらもう一度
      let value = Number(selected.value); // valueに値を入れる

      //  各タイプの集計
      if([1,3,6,12,14].includes(i)){ active += value; }
      else if([2,11,18,17].includes(i)){ care += value; }
      else if([4,10,16,20].includes(i)){ stable += value; }
      else if([5,7,8,9,13,15,19].includes(i)){ depend += value; }
    }

    //  ローカルストレージに保存
    localStorage.setItem("active", active);
    localStorage.setItem("care", care);
    localStorage.setItem("stable", stable);
    localStorage.setItem("depend", depend);

    // 結果ページへ遷移
    setTimeout(()=>{
      location.href = "result.html";
    },500); // 0.5秒後
  });
}


const startBtn = document.getElementById("startBtn"); // startBtnを取得
const textBox = document.querySelector(".text-box"); // 質問フォームを取得 

if(startBtn){
  startBtn.addEventListener("click", () => {
    //「診断スタート」ボタンのある画面を消す
    if(textBox){ textBox.style.display = "none"; }
    
    // 診断フォームを表示する（この時点ではまだ中身は空）
    if(form){ form.style.display = "block"; }
    
    // JSONから質問を読み込んで画面に表示する
    loadQuestions();
  });
}