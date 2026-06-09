// ========================================
// グローバル変数
// ========================================

// Three.jsで使う基本オブジェクト
let scene;      // シーン
let camera;     // カメラ
let renderer;   // レンダラー

// 読み込んだキャラクターモデル
let model;

// 頭のボーン（首振り用）
let headBone;

// 腰のボーン（位置固定用）
let hipBone;

// アニメーション再生用
let mixer;

// 時間計測用
const clock = new THREE.Clock();

// マウス位置
let mouseX = 0;
let mouseY = 0;

// 頭が向く目標角度
let targetRotationX = 0;
let targetRotationY = 0;

// 頭が回転できる最大角度
const MAX_ROTATION_X = 1.2; // 左右
const MAX_ROTATION_Y = 1.2; // 上下

// ========================================
// 初期化
// ========================================
init3D();

function init3D() {

    // HTML要素を取得
    const container = document.getElementById('canvas-container');
    const canvas = document.getElementById('avatarCanvas');

    // ========================================
    // シーン作成
    // ========================================
    scene = new THREE.Scene();

    // ========================================
    // カメラ作成
    // ========================================
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        1,
        100000
    );

    camera.position.set(0, 0, 150);
    camera.lookAt(0, 0, 0);

    // ========================================
    // レンダラー作成
    // ========================================
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // ========================================
    // ライト設定
    // ========================================

    // 全体を明るくするライト
    const ambientLight =
        new THREE.AmbientLight(0xffffff, 1);

    scene.add(ambientLight);

    // 太陽光のようなライト
    const directionalLight =
        new THREE.DirectionalLight(0xffffff, 1);

    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;

    scene.add(directionalLight);

    // ========================================
    // モデル読み込み
    // ========================================
    const loader = new THREE.FBXLoader();

    loader.load(

        './Idle.fbx',

        // 読み込み成功
        function (object) {

            model = object;

            console.log("----- ボーン確認 -----");

            // モデル内を調べる
            model.traverse(function (child) {

                // メッシュ設定
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }

                // ボーンを探す
                if (child.isBone) {

                    console.log(child.name);

                    const boneName =
                        child.name.toLowerCase();

                    // 頭ボーンを探す
                    if (
                        boneName.includes('head') &&
                        !boneName.includes('top')
                    ) {
                        headBone = child;

                        console.log(
                            "頭ボーン:",
                            child.name
                        );
                    }

                    // 腰ボーンを探す
                    if (
                        boneName.includes('hip') ||
                        boneName.includes('hips')
                    ) {
                        hipBone = child;

                        console.log(
                            "腰ボーン:",
                            child.name
                        );
                    }
                }
            });

            // headが見つからない場合はneckを使用
            if (!headBone) {

                model.traverse(function (child) {

                    if (
                        child.isBone &&
                        child.name
                            .toLowerCase()
                            .includes('neck')
                    ) {
                        headBone = child;
                    }
                });
            }

            // シーンへ追加
            scene.add(model);

            // ========================================
            // アニメーション再生
            // ========================================
            if (
                model.animations &&
                model.animations.length > 0
            ) {

                mixer =
                    new THREE.AnimationMixer(model);

                const action =
                    mixer.clipAction(
                        model.animations[0]
                    );

                action.play();
            }

            // ========================================
            // モデル位置調整
            // ========================================
            model.position.set(
                0,
                -145,
                0
            );

            camera.position.set(
                0,
                0,
                150
            );

            camera.lookAt(0, 0, 0);

            // 描画開始
            animate();

            scene.add(model);

            animate();

            // タイトル画面を消す
            setTimeout(() => {
                document.getElementById('splash').remove();
            }, 500);
        },

        // 読み込み中
        function () {},

        // エラー
        function (error) {
            console.error(
                'モデルの読み込み失敗',
                error
            );
        }
    );

    // イベント登録
    window.addEventListener(
        'mousemove',
        onMouseMove
    );

    window.addEventListener(
        'resize',
        onWindowResize
    );
}

// ========================================
// マウス移動
// ========================================
function onMouseMove(event) {

    // -1 ～ 1 に変換
    mouseX =
        (event.clientX / window.innerWidth) * 2 - 1;

    mouseY =
        -(event.clientY / window.innerHeight) * 2 + 1;

    // 回転目標値を計算
    targetRotationX =
        mouseX * MAX_ROTATION_X;

    targetRotationY =
        mouseY * MAX_ROTATION_Y;
}

// ========================================
// 毎フレーム実行
// ========================================
function animate() {

    requestAnimationFrame(animate);

    // アニメーション更新
    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);
    }

    // ========================================
    // 腰位置固定
    // ========================================
    if (hipBone) {

        // 左右移動防止
        hipBone.position.x = 0;

        // 前後移動防止
        hipBone.position.z = 0;
    }

    // ========================================
    // 頭をマウス方向へ向ける
    // ========================================
    if (headBone) {

        headBone.rotation.reorder('YXZ');

        // 左右
        headBone.rotation.y +=
            (targetRotationX -
                headBone.rotation.y) * 0.9;

        // 上下
        headBone.rotation.x +=
            (-targetRotationY -
                headBone.rotation.x) * 0.3;
    }

    // 描画
    renderer.render(scene, camera);
}

// ========================================
// ウィンドウサイズ変更
// ========================================
function onWindowResize() {

    const container =
        document.getElementById(
            'canvas-container'
        );

    camera.aspect =
        container.clientWidth /
        container.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );
}