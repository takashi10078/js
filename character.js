/* meshyAIやblender、mixamoを使ったことがあったのでthree.jsを使用してみました */

// Three.jsの基本オブジェクト
let scene;      // シーン
let camera;     // カメラ
let renderer;   // レンダラー

// 読み込んだキャラクターモデル
let model;

// 各部位のボーン
let headBone;   // 頭のボーン
let hipBone;    // 腰のボーン

// アニメーション用
let mixer;      // アニメーション再生用
const clock = new THREE.Clock(); // 時間計測用

// マウス位置
let mouseX = 0;
let mouseY = 0;

// 頭の目標角度
let targetRotationX = 0;
let targetRotationY = 0;

// 頭が回転できる最大角度
const MAX_ROTATION_X = 1.2; // 左右の限界
const MAX_ROTATION_Y = 1.2; // 上下の限界

// 初期化処理を実行
init3D();

function init3D() {

    // HTML要素を取得
    const container = document.getElementById('canvas-container');
    const canvas = document.getElementById('avatarCanvas');

    // シーン作成
    scene = new THREE.Scene();

    // カメラ作成
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        1,
        100000
    );

    // カメラの位置と向きを設定
    camera.position.set(0, 0, 150);
    camera.lookAt(0, 0, 0);

    // レンダラー作成（コンピューター上で計算や処理を行って、最終的な画像や映像、音声などを画面に表示・出力する機能やプログラム）
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true, // 線をなめらかにする
        alpha: true      // 背景を透明にする
    });

    // レンダラーのサイズと影の設定
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // 影を有効化

    // 環境光（全体を明るくするライト）
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // 平行光源（太陽光のようなライト）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true; // 影を落とす
    scene.add(directionalLight);

    // モデルの読み込み
    const loader = new THREE.FBXLoader();

    loader.load(
        './Idle.fbx', /* meshyに作ってもらったfbxファイル */

        // 読み込み成功時の処理
        function (object) {
            model = object;

            console.log("----- ボーン確認 -----");

            // モデル内の全パーツを調べる
            model.traverse(function (child) {

                // メッシュに影の設定を適用
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }

                // ボーンを探す
                if (child.isBone) {
                    console.log(child.name);
                    const boneName = child.name.toLowerCase();

                    // 頭ボーンの特定
                    if (
                        boneName.includes('head') &&
                        !boneName.includes('top')
                    ) {
                        headBone = child;
                        console.log("頭発見:", child.name);
                    }

                    // 腰ボーンの特定
                    if (
                        boneName.includes('hip') ||
                        boneName.includes('hips')
                    ) {
                        hipBone = child;
                        console.log("腰発見:", child.name);
                    }
                }
            });

            // 頭が見つからない場合は首で代用
            if (!headBone) {
                model.traverse(function (child) {
                    if (
                        child.isBone &&
                        child.name.toLowerCase().includes('neck')
                    ) {
                        headBone = child;
                    }
                });
            }

            // シーンにモデルを追加
            scene.add(model);

            // アニメーションの再生準備
            if (
                model.animations &&
                model.animations.length > 0
            ) {
                mixer = new THREE.AnimationMixer(model);
                const action = mixer.clipAction(model.animations[0]);
                action.play(); // 再生
            }

            // モデルとカメラの位置を最終調整
            model.position.set(0, -145, 0);
            camera.position.set(0, 0, 150);
            camera.lookAt(0, 0, 0);

            // 描画ループを開始
            animate();

            // ローディング画面を消去
            setTimeout(() => {
                document.getElementById('splash').remove();
            }, 500);
        },

        // 読み込み中の処理
        function () {},

        // エラー時の処理
        function (error) {
            console.error('モデルの読み込み失敗', error);
        }
    );

    // イベントリスナーの登録
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
}

// マウス移動時の処理
function onMouseMove(event) {

    // マウス位置を変換
    // 画面サイズが変わっても同じ計算で扱えるようにする
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // マウス位置から頭の目標角度を計算
    targetRotationX = mouseX * MAX_ROTATION_X;
    targetRotationY = mouseY * MAX_ROTATION_Y;
}

// 毎フレームの更新処理
function animate() {
    requestAnimationFrame(animate);

    // アニメーションの時間を更新
    const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta);
    }

    // 腰の位置を固定（左右前後の移動を防止）
    if (hipBone) {
        hipBone.position.x = 0;
        hipBone.position.z = 0;
    }

    // 頭をマウス方向へなめらかに向ける
    if (headBone) {
        headBone.rotation.reorder('YXZ'); // 回転順序を固定

        // 左右の回転
        headBone.rotation.y +=
            (targetRotationX - headBone.rotation.y) * 0.9;

        // 上下の回転
        headBone.rotation.x +=
            (-targetRotationY - headBone.rotation.x) * 0.3;
    }

    // 画面を描画
    renderer.render(scene, camera);
}

// ウィンドウサイズ変更時の処理
function onWindowResize() {
    const container = document.getElementById('canvas-container');

    // カメラのアスペクト比を再計算
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    // レンダラーのサイズを再設定
    renderer.setSize(container.clientWidth, container.clientHeight);
}