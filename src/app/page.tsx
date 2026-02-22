"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";
type Mode = "classic" | "wrap";
type Difficulty = "easy" | "normal" | "hard";

type GameStatus = "ready" | "running" | "paused" | "gameover";

type Food = {
  position: Point;
  kind: "normal" | "bonus";
  expiresAt?: number;
};

const BOARD_SIZE = 24;
const BONUS_FOOD_CHANCE = 0.18;
const BONUS_FOOD_LIFETIME_MS = 5500;
const BASE_POINTS = 10;
const BONUS_POINTS = 35;
const LEVEL_UP_STEP = 5;

const DIRECTION_STEP: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

const TICK_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 155,
  normal: 125,
  hard: 95
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "悠闲",
  normal: "经典",
  hard: "极限"
};

function pointToKey(point: Point) {
  return `${point.x}-${point.y}`;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function createInitialSnake(): Point[] {
  const center = Math.floor(BOARD_SIZE / 2);
  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center }
  ];
}

function isInside(point: Point) {
  return point.x >= 0 && point.x < BOARD_SIZE && point.y >= 0 && point.y < BOARD_SIZE;
}

function createObstacles(level: number, occupied: Set<string>) {
  const count = Math.min(level + 2, 18);
  const obstacles = new Set<string>();

  while (obstacles.size < count) {
    const point = { x: randomInt(BOARD_SIZE), y: randomInt(BOARD_SIZE) };
    const key = pointToKey(point);
    if (occupied.has(key) || obstacles.has(key)) continue;
    // 保留中央出生区域
    const center = BOARD_SIZE / 2;
    if (Math.abs(point.x - center) <= 3 && Math.abs(point.y - center) <= 3) continue;
    obstacles.add(key);
  }

  return obstacles;
}

function createFood(occupied: Set<string>, allowBonus = true): Food {
  let next: Point = { x: 0, y: 0 };
  do {
    next = { x: randomInt(BOARD_SIZE), y: randomInt(BOARD_SIZE) };
  } while (occupied.has(pointToKey(next)));

  if (allowBonus && Math.random() < BONUS_FOOD_CHANCE) {
    return {
      position: next,
      kind: "bonus",
      expiresAt: Date.now() + BONUS_FOOD_LIFETIME_MS
    };
  }

  return { position: next, kind: "normal" };
}

export default function SnakeGamePage() {
  const [snake, setSnake] = useState<Point[]>(createInitialSnake);
  const [direction, setDirection] = useState<Direction>("right");
  const [queuedDirection, setQueuedDirection] = useState<Direction>("right");
  const [status, setStatus] = useState<GameStatus>("ready");
  const [mode, setMode] = useState<Mode>("classic");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [food, setFood] = useState<Food>(() => {
    const occupied = new Set(createInitialSnake().map(pointToKey));
    return createFood(occupied);
  });
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(1);
  const [recordTable, setRecordTable] = useState<number[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedBest = Number(localStorage.getItem("snake-best-score") || "0");
    setBestScore(storedBest);
    const records = JSON.parse(localStorage.getItem("snake-records") || "[]") as number[];
    setRecordTable(records);
  }, []);

  const occupiedCells = useMemo(() => {
    const set = new Set<string>();
    snake.forEach((segment) => set.add(pointToKey(segment)));
    obstacles.forEach((block) => set.add(block));
    return set;
  }, [snake, obstacles]);

  const resetGame = useCallback(() => {
    const initialSnake = createInitialSnake();
    const snakeSet = new Set(initialSnake.map(pointToKey));
    setSnake(initialSnake);
    setDirection("right");
    setQueuedDirection("right");
    setStatus("ready");
    setScore(0);
    setLevel(1);
    setCombo(1);
    const obstacleSet = createObstacles(1, snakeSet);
    setObstacles(obstacleSet);
    const mergedOccupied = new Set([...snakeSet, ...obstacleSet]);
    setFood(createFood(mergedOccupied));
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame, mode, difficulty]);

  const finishGame = useCallback(() => {
    setStatus("gameover");
    setBestScore((prev) => {
      const next = Math.max(prev, score);
      localStorage.setItem("snake-best-score", String(next));
      return next;
    });
    setRecordTable((prev) => {
      const merged = [...prev, score].sort((a, b) => b - a).slice(0, 5);
      localStorage.setItem("snake-records", JSON.stringify(merged));
      return merged;
    });
  }, [score]);

  const gameTick = useCallback(() => {
    setSnake((currentSnake) => {
      const nextDirection = queuedDirection;
      setDirection(nextDirection);

      const head = currentSnake[0];
      const step = DIRECTION_STEP[nextDirection];
      let nextHead: Point = { x: head.x + step.x, y: head.y + step.y };

      if (mode === "wrap") {
        nextHead = {
          x: (nextHead.x + BOARD_SIZE) % BOARD_SIZE,
          y: (nextHead.y + BOARD_SIZE) % BOARD_SIZE
        };
      }

      if (mode === "classic" && !isInside(nextHead)) {
        finishGame();
        return currentSnake;
      }

      const headKey = pointToKey(nextHead);
      const tail = currentSnake[currentSnake.length - 1];
      const tailKey = pointToKey(tail);
      const bodySet = new Set(currentSnake.map(pointToKey));
      bodySet.delete(tailKey);

      if (bodySet.has(headKey) || obstacles.has(headKey)) {
        finishGame();
        return currentSnake;
      }

      const ateFood = headKey === pointToKey(food.position);
      const grownSnake = [nextHead, ...currentSnake];
      if (!ateFood) {
        grownSnake.pop();
      }

      if (ateFood) {
        const plus = food.kind === "bonus" ? BONUS_POINTS * combo : BASE_POINTS * combo;
        const nextScore = score + plus;
        const nextLevel = Math.floor(nextScore / (LEVEL_UP_STEP * BASE_POINTS)) + 1;

        setScore(nextScore);
        setLevel(nextLevel);
        setCombo((prev) => Math.min(prev + 1, 6));

        const nextSnakeSet = new Set(grownSnake.map(pointToKey));
        const nextObstacles = createObstacles(nextLevel, nextSnakeSet);
        setObstacles(nextObstacles);
        const nextOccupied = new Set([...nextSnakeSet, ...nextObstacles]);
        setFood(createFood(nextOccupied));
      } else {
        setCombo(1);
      }

      return grownSnake;
    });
  }, [queuedDirection, mode, obstacles, food, finishGame, score, combo]);

  useEffect(() => {
    if (status !== "running") return;

    const speedUp = Math.max(35, TICK_BY_DIFFICULTY[difficulty] - (level - 1) * 3);
    timerRef.current = setInterval(gameTick, speedUp);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, gameTick, difficulty, level]);

  useEffect(() => {
    if (food.kind === "bonus" && food.expiresAt && Date.now() > food.expiresAt) {
      setFood(createFood(occupiedCells, false));
    }

    const interval = setInterval(() => {
      if (food.kind === "bonus" && food.expiresAt && Date.now() > food.expiresAt) {
        setFood(createFood(occupiedCells, false));
      }
    }, 300);

    return () => clearInterval(interval);
  }, [food, occupiedCells]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right"
      };

      const next = keyMap[event.key];
      if (!next) {
        if (event.key === " " && status !== "gameover") {
          setStatus((prev) => (prev === "running" ? "paused" : "running"));
        }
        return;
      }

      event.preventDefault();
      setQueuedDirection((prev) => {
        const current = status === "running" ? prev : direction;
        if (OPPOSITE_DIRECTION[current] === next) return current;
        return next;
      });

      if (status === "ready" || status === "paused") setStatus("running");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, direction]);

  const foodKey = pointToKey(food.position);
  const snakeSet = useMemo(() => new Set(snake.map(pointToKey)), [snake]);

  const bonusCountdown =
    food.kind === "bonus" && food.expiresAt ? Math.max(0, Math.ceil((food.expiresAt - Date.now()) / 1000)) : null;

  return (
    <main className="snake-page">
      <section className="panel">
        <header className="topbar">
          <h1>霓虹贪吃蛇 · 挑战版</h1>
          <p>方向键/WASD 控制，空格暂停。吃得越快，速度越快！</p>
        </header>

        <div className="stats">
          <div>
            <span>分数</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span>历史最高</span>
            <strong>{bestScore}</strong>
          </div>
          <div>
            <span>等级</span>
            <strong>{level}</strong>
          </div>
          <div>
            <span>连击</span>
            <strong>x{combo}</strong>
          </div>
        </div>

        <div className="controls-row">
          <label>
            难度
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
              {Object.keys(TICK_BY_DIFFICULTY).map((item) => (
                <option key={item} value={item}>
                  {DIFFICULTY_LABEL[item as Difficulty]}
                </option>
              ))}
            </select>
          </label>
          <label>
            模式
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              <option value="classic">经典穿墙禁用</option>
              <option value="wrap">穿墙模式</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setStatus((prev) => (prev === "running" ? "paused" : "running"))}
            disabled={status === "gameover"}
          >
            {status === "running" ? "暂停" : "开始 / 继续"}
          </button>
          <button type="button" onClick={resetGame}>
            重开
          </button>
        </div>

        {food.kind === "bonus" && bonusCountdown !== null && <p className="bonus-tip">⭐ 奖励食物倒计时：{bonusCountdown}s</p>}

        <div className="board" role="img" aria-label="贪吃蛇棋盘">
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            const key = `${x}-${y}`;
            const isHead = key === pointToKey(snake[0]);
            const isSnake = snakeSet.has(key);
            const isFood = key === foodKey;
            const isObstacle = obstacles.has(key);

            let className = "cell";
            if (isObstacle) className += " obstacle";
            if (isSnake) className += isHead ? " snake-head" : " snake-body";
            if (isFood) className += food.kind === "bonus" ? " bonus-food" : " food";

            return <div key={key} className={className} />;
          })}
        </div>

        <div className="mobile-pad" aria-hidden>
          <button onClick={() => setQueuedDirection("up")}>↑</button>
          <div>
            <button onClick={() => setQueuedDirection("left")}>←</button>
            <button onClick={() => setQueuedDirection("down")}>↓</button>
            <button onClick={() => setQueuedDirection("right")}>→</button>
          </div>
        </div>

        <footer className="footer-info">
          <p>状态：{status === "gameover" ? "游戏结束" : status === "running" ? "进行中" : status === "paused" ? "已暂停" : "待开始"}</p>
          <ol>
            {recordTable.map((item, idx) => (
              <li key={`${item}-${idx}`}>Top {idx + 1}：{item}</li>
            ))}
          </ol>
        </footer>
      </section>
    </main>
  );
}
