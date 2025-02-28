/**
 * Global Variables
 */
const answerLength = 5; // 固定的答案长度
const maxGuessTime = 6; // 最多尝试次数
const grey = "b"; // 灰色用字母 b 表示
const yellow = "y"; // 黄色
const green = "g"; // 绿色

let colorSequence = []; // 颜色序列
let wordSequence = []; // 单词序列
let answer = ""; // 当前 Wordle 的答案
let currentGuessTime = 0; // 当前已经使用的猜测次数
let state = "UNFINISHED"; // 当前程序状态

/**
 * 初始化程序并绑定事件
 */
function start() {
    initialize(); // 初始化程序状态

    // 绑定虚拟键盘事件
    const keys = document.querySelectorAll(".key");
    keys.forEach(key => {
        key.addEventListener("click", () => {
            const keyContent = key.textContent.trim();

            // 根据按键内容决定调用哪个函数
            if (keyContent === "ENTER") {
                submitGuess();
            } else if (keyContent === "BACKSPACE") {
                deleteCharacter();
            } else {
                handleKeyClick(keyContent);
            }
        });
    });

    // 监听真实键盘事件
    document.addEventListener("keydown", (event) => {
        const key = event.key.toUpperCase(); // 获取按键值并转换为大写

        // 根据按键内容决定调用哪个函数
        if (key === "ENTER") {
            submitGuess();
        } else if (key === "BACKSPACE") {
            deleteCharacter();
        } else if (/^[A-Z]$/.test(key)) { // 检查是否为字母键
            handleKeyClick(key); // 处理字母键
        }
    });

    render(); // 渲染初始页面
}

/**
 * 渲染游戏界面
 */
function render() {
    const gameBoard = document.getElementById("game-board");

    // 清空棋盘
    gameBoard.innerHTML = "";

    // 预先渲染 maxGuessTime 行（即 6 行）
    for (let rowIndex = 0; rowIndex < maxGuessTime; rowIndex++) {
        const row = document.createElement("div");
        row.className = "row";

        // 每行包含 answerLength 个单元格（即 5 个单元格）
        for (let i = 0; i < answerLength; i++) {
            const cell = document.createElement("div");
            cell.className = "cell";

            // 如果当前行有对应的单词，则填充内容和颜色
            if (rowIndex < wordSequence.length && wordSequence[rowIndex]) {
                const word = wordSequence[rowIndex];
                if (i < word.length) {
                    cell.textContent = word[i];

                    // 获取颜色并设置样式类
                    const colorIndex = rowIndex * answerLength + i;
                    const color = colorSequence[colorIndex] || grey;
                    if (color === green) {
                        cell.classList.add("correct");
                    } else if (color === yellow) {
                        cell.classList.add("present");
                    } else if (color === grey) {
                        cell.classList.add("absent");
                    }
                }
            } else if (rowIndex === currentGuessTime && wordSequence[rowIndex] && i < wordSequence[rowIndex].length) {
                // 显示当前输入行的字母
                cell.textContent = wordSequence[rowIndex][i];
            }

            row.appendChild(cell); // 将单元格添加到行中
        }

        gameBoard.appendChild(row); // 将行添加到棋盘中
    }

    // 如果游戏结束，显示结果
    if (state === "SOLVED") {
        alert("Congratulations! You solved the Wordle!");
    } else if (state === "FAILED") {
        alert(`Game Over! The correct answer was: ${answer}`);
    }
}

/**
 * 初始化程序的状态
 */
function initialize() {
    answer = generateRandomAnswer(); // 随机生成答案
    currentGuessTime = 0; // 重置猜测次数
    state = "UNFINISHED"; // 设置初始状态为未完成
    colorSequence = []; // 清空颜色序列
    wordSequence = Array(maxGuessTime).fill(""); // 初始化单词序列，每行为空字符串
}

/**
 * 从内置题库中随机选取一个单词作为答案
 * @return {string} answer
 */
function generateRandomAnswer() {
    // 内置的五个字母单词题库
    const wordBank = ["apple", "grape", "peach", "melon", "berry", "lemon", "plums", "kiwis", "banan"];
    
    // 随机选择一个单词
    return wordBank[Math.floor(Math.random() * wordBank.length)];
}

/**
 * 判断一个单词是否合法
 * @param {string} word
 * @return {boolean} isValid
 */
function isValidWord(word) {
    const wordBank = ["apple", "grape", "peach", "melon", "berry", "lemon", "plums", "kiwis", "banan"];
    return wordBank.includes(word.toLowerCase());
}

/**
 * 处理一次对单词的猜测，并根据其猜测结果更新程序内部状态
 * @param {string} guess
 */
function handleAnswer(guess) {
    if (!isValidWord(guess)) {
        alert("Invalid word. Please try again.");
        return;
    }

    const colorSeq = calculateColorSequence(guess, answer); // 计算颜色匹配序列
    wordSequence[currentGuessTime] = guess; // 更新当前行的单词
    colorSequence = colorSequence.concat(colorSeq.split("")); // 更新颜色序列

    currentGuessTime++; // 增加猜测次数

    // 更新游戏状态
    if (guess === answer) {
        state = "SOLVED";
    } else if (currentGuessTime >= maxGuessTime) {
        state = "FAILED";
    }

    render(); // 重新渲染页面
}

/**
 * 计算两个单词的颜色匹配序列
 * @param {string} guess
 * @param {string} answer
 * @return {string} colorSequence
 */
function calculateColorSequence(guess, answer) {
    let result = Array(answerLength).fill(grey); // 初始化颜色序列

    // 统计答案中每个字母的出现次数
    const letterCount = {};
    for (let i = 0; i < answerLength; i++) {
        const letter = answer[i];
        if (letterCount[letter]) {
            letterCount[letter]++;
        } else {
            letterCount[letter] = 1;
        }
    }

    // 先处理绿色（完全匹配）
    for (let i = 0; i < answerLength; i++) {
        if (guess[i] === answer[i]) {
            result[i] = green; // 标记为绿色
            letterCount[guess[i]]--; // 减少对应字母的计数
        }
    }

    // 再处理黄色（字母存在但位置不对）
    for (let i = 0; i < answerLength; i++) {
        if (result[i] !== green && letterCount[guess[i]] > 0) {
            result[i] = yellow; // 标记为黄色
            letterCount[guess[i]]--; // 减少对应字母的计数
        }
    }

    return result.join("");
}

/**
 * 处理键盘按键点击事件
 * @param {string} key
 */
function handleKeyClick(key) {
    // 过滤掉特殊按键
    if (key === "ENTER" || key === "BACKSPACE") {
        return;
    }

    const currentRow = wordSequence[currentGuessTime] || "";
    if (currentRow.length < answerLength) { // 检查是否超出答案长度
        wordSequence[currentGuessTime] = (currentRow + key).toUpperCase(); // 添加新字母
        render(); // 重新渲染页面
    }
}

/**
 * 提交当前行的猜测
 */
function submitGuess() {
    const currentRow = wordSequence[currentGuessTime];
    if (currentRow && currentRow.length === answerLength) {
        handleAnswer(currentRow.toLowerCase());
    } else {
        alert("Please enter a valid word of length " + answerLength);
    }
}

/**
 * 删除当前行的最后一个字符
 */
function deleteCharacter() {
    // 检查 currentGuessTime 是否有效
    if (currentGuessTime >= wordSequence.length) {
        console.error("Invalid currentGuessTime");
        return;
    }

    const currentRow = wordSequence[currentGuessTime] || "";
    if (typeof currentRow !== "string") {
        console.error("wordSequence[currentGuessTime] is not a string");
        return;
    }

    if (currentRow.length === 0) {
        alert("Nothing to delete in the current row.");
        return;
    }

    wordSequence[currentGuessTime] = currentRow.slice(0, -1); // 移除最后一个字母
    render(); // 重新渲染页面以更新显示
}