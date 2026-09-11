export function parseBeaconCli(args) {
  const [command, ...rest] = args;
  if (command === 'today' && rest.length === 0) return 'beacon://today';
  if (command === 'goal' && rest[1] === 'open' && rest[0]) return `beacon://goal/${encodeURIComponent(rest[0])}`;
  if (command === 'goal' && rest[1] === 'increment' && rest[0]) {
    const amount = rest[2] === undefined ? '' : `?amount=${encodeURIComponent(rest[2])}`;
    return `beacon://goal/${encodeURIComponent(rest[0])}/increment${amount}`;
  }
  if (command === 'action' && rest[1] === 'done' && rest[0]) return `beacon://action/${encodeURIComponent(rest[0])}/done`;
  if (command === 'action' && rest[1] === 'plan' && rest[0]) return `beacon://action/${encodeURIComponent(rest[0])}/plan`;
  throw new Error('Usage: beacon today | beacon goal <id> open | beacon goal <id> increment [amount] | beacon action <id> done|plan');
}
