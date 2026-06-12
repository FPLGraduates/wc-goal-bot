const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const announcedGoals = new Set();

const teamFlags = {
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'Korea Republic': '🇰🇷', 'Czechia': '🇨🇿',
  'Canada': '🇨🇦', 'Bosnia and Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷', 'Colombia': '🇨🇴', 'Côte d\'Ivoire': '🇨🇮', 'Tunisia': '🇹🇳',
  'United States': '🇺🇸', 'USA': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Türkiye': '🇹🇷',
  'Spain': '🇪🇸', 'Morocco': '🇲🇦', 'Japan': '🇯🇵', 'Haiti': '🇭🇹',
  'France': '🇫🇷', 'Algeria': '🇩🇿', 'Argentina': '🇦🇷', 'Jordan': '🇯🇴',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Senegal': '🇸🇳', 'Netherlands': '🇳🇱', 'Curaçao': '🇨🇼',
  'Portugal': '🇵🇹', 'DR Congo': '🇨🇩', 'Uzbekistan': '🇺🇿',
  'Germany': '🇩🇪', 'Saudi Arabia': '🇸🇦', 'Belgium': '🇧🇪', 'Cabo Verde': '🇨🇻',
  'Ghana': '🇬🇭', 'Ecuador': '🇪🇨', 'Uruguay': '🇺🇾', 'Iraq': '🇮🇶',
  'Panama': '🇵🇦', 'Egypt': '🇪🇬', 'Croatia': '🇭🇷', 'Iran': '🇮🇷',
  'Norway': '🇳🇴', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Sweden': '🇸🇪', 'Austria': '🇦🇹',
  'Serbia': '🇷🇸', 'New Zealand': '🇳🇿', 'South Korea': '🇰🇷',
};

async function checkForGoals() {
  try {
    const res = await axios.get(
      'https://api.football-data.org/v4/competitions/WC/matches?status=IN_PLAY',
      { headers: { 'X-Auth-Token': FOOTBALL_API_KEY } }
    );

    console.log('Live matches found:', res.data.matches.length);

    for (const match of res.data.matches) {
      const goals = match.goals || [];

      console.log(`Goals in match ${match.homeTeam.name} vs ${match.awayTeam.name}:`, goals.length);

      for (const goal of goals) {
        const goalId = `${match.id}-${goal.minute}-${goal.scorer.name}`;
        if (announcedGoals.has(goalId)) continue;
        announcedGoals.add(goalId);

        const teamName = goal.team?.name || '';
        const flag = teamFlags[teamName] || '🏳️';
        const assist = goal.assist?.name ? `\n🅰️ ${goal.assist.name}` : '';
        const homeScore = match.score.fullTime.home ?? match.score.halfTime.home ?? '?';
        const awayScore = match.score.fullTime.away ?? match.score.halfTime.away ?? '?';

        const message = [
          `⚽ **GOAL! ${match.homeTeam.name} ${homeScore} - ${awayScore} ${match.awayTeam.name}**`,
          ``,
          `${flag} **${goal.scorer.name}**`,
          assist,
          `⏱️ ${goal.minute}'`
        ].filter(Boolean).join('\n');

        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send(message);
      }
    }
  } catch (err) {
    console.error('Error checking for goals:', err.message);
  }
}

client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  console.log('CHANNEL ID IN USE:', CHANNEL_ID);
  setInterval(checkForGoals, 30000);
});

client.login(DISCORD_TOKEN);
