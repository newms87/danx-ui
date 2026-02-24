import { nextTick, onMounted, onUnmounted, ref } from "vue";

const levels = ["INFO", "WARN", "ERROR", "DEBUG"];
const messages = [
  "Request received from 192.168.1.42",
  "Database query executed in 23ms",
  "Cache miss for key user:1234",
  "Connection pool: 5/10 active",
  "Failed to parse JSON payload\n  at line 42, column 8\n  unexpected token '}'",
  "Retrying operation (attempt 2/3)",
  "Memory usage: 256MB / 512MB",
  "Background job completed: email_batch_42",
  "Rate limit exceeded for client api-key-xyz",
  "SSL certificate expires in 14 days",
  "Worker process spawned (PID 12847)",
  "Slow query detected (>500ms):\n  SELECT * FROM orders\n  WHERE created_at > '2024-01-01'\n  ORDER BY total DESC",
];

let nextId = 100;

function createLog() {
  return {
    id: nextId++,
    timestamp: new Date().toISOString().slice(11, 23),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
  };
}

export function levelColor(level) {
  if (level === "ERROR") return "color: var(--color-danger)";
  if (level === "WARN") return "color: var(--color-warning)";
  if (level === "DEBUG") return "color: var(--color-text-subtle)";
  return "color: var(--color-info)";
}

export function useLogDemo() {
  const logs = ref(Array.from({ length: 100 }, () => createLog()));
  const scrollPosition = ref(0);
  const autoScroll = ref(true);
  const keyFn = (item) => item.id;

  function scrollToBottom() {
    if (autoScroll.value) {
      scrollPosition.value = logs.value.length - 1;
    }
  }

  function onScrollPositionUpdate(index) {
    autoScroll.value = index >= logs.value.length - 20;
  }

  let timer = null;

  function scheduleNextLog() {
    timer = setTimeout(
      () => {
        logs.value = [...logs.value, createLog()];
        nextTick(scrollToBottom);
        scheduleNextLog();
      },
      1000 + Math.random() * 4000
    );
  }

  onMounted(() => {
    nextTick(scrollToBottom);
    scheduleNextLog();
  });

  onUnmounted(() => {
    clearTimeout(timer);
  });

  return { logs, scrollPosition, autoScroll, keyFn, onScrollPositionUpdate };
}
