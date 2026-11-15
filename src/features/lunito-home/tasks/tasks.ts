export function taskProgress(done: boolean[]) {
  const total = done.length;
  const count = done.filter(Boolean).length;
  return {
    count,
    total,
    percent: total === 0 ? 0 : Math.round((count / total) * 100),
    label: `${count} de ${total} completadas`,
  };
}
