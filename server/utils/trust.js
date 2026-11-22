export const computeBadges = (u) => {
  const b = [];
  if (u.helpedCount >= 1) b.push('First Helper');
  if (u.helpedCount >= 5) b.push('Problem Solver');
  if (u.helpedCount >= 15) b.push('Community Hero');
  if (u.trustScore >= 80) b.push('Trusted Mentor');
  if (u.points >= 100) b.push('Century Club');
  return b;
};

export async function rewardHelper(user, urgency) {
  const pts = urgency === 'High' ? 15 : 10;
  user.helpedCount += 1;
  user.points += pts;
  user.trustScore = Math.min(100, user.trustScore + 5);
  user.badges = computeBadges(user);
  await user.save();
  return pts;
}
