import { referenceCommandCategories } from "./referenceCommands";

export type WareCommandDoc = {
  name: string;
  description: string;
  usage: string;
  example: string;
  aliases?: string[];
  permission?: string;
};

const lfm = (
  name: string,
  description: string,
  usage: string,
  permission = "None",
  aliases?: string[],
): WareCommandDoc => ({ name, description, usage, example: usage, permission, aliases });

export const lastFmCategory = {
  slug: "lastfm",
  name: "Last.fm",
  description: "Connect Last.fm, view scrobbles, compare music taste, and explore listening statistics.",
  commands: [
    lfm("lastfm", "Integrate your Last.fm account with Stained and view your scrobble stats", ",lastfm", "None"),
    lfm("lastfm mode", "Use a different embed for NP or create your own", ",lastfm mode (type)", "Tier 1 Only"),
    lfm("lastfm color", "Set embed color for Last.fm commands", ",lastfm color (hexc)", "None"),
    lfm("lastfm logout", "Remove your Last.fm account with Stained's internal system", ",lastfm logout", "None"),
    lfm("lastfm taste", "Compare your music taste between you and someone else", ",lastfm taste (member) (period)", "None"),
    lfm("lastfm playsall", "Check how many plays you have for every song on an album", ",lastfm playsall (member) (artist and album)", "None"),
    lfm("lastfm update", "Update your Last.fm library", ",lastfm update (parameters)", "None"),
    lfm("lastfm topartists", "View your most listened to artists", ",lastfm topartists (member) (period)", "None"),
    lfm("lastfm playsalbum", "Check how many plays you have for an album", ",lastfm playsalbum (member) (artist and album)", "None"),
    lfm("lastfm toptracks", "View your most listened to tracks", ",lastfm toptracks (member) (period)", "None"),
    lfm("lastfm favorites", "View yours or a member's liked tracks", ",lastfm favorites (member)", "None"),
    lfm("lastfm milestone", "See what track your given number scrobble was.", ",lastfm milestone (number)", "None"),
    lfm("lastfm streak", "View your current listening streak", ",lastfm streak (member)", "None"),
    lfm("lastfm playstrack", "Check how many plays you have for a specific track", ",lastfm playstrack (member) (artist and track)", "None"),
    lfm("lastfm count", "View your total Last.fm scrobbles", ",lastfm count (member)", "None"),
    lfm("lastfm topalbums", "View your most listened to albums", ",lastfm topalbums (member) (period)", "None"),
    lfm("lastfm collage", "View a collage of your most listened to albums", ",lastfm collage (member) (rows x cols) (period)", "None"),
    lfm("lastfm hide", "Hide users from appearing on whoknows commands", ",lastfm hide (member)", "Manage Guild"),
    lfm("lastfm hide list", "View the list of all hidden members", ",lastfm hide list", "None"),
    lfm("lastfm whois", "View Last.fm profile information", ",lastfm whois (member)", "None"),
    lfm("lastfm url", "Submit your own artworks for an album cover if you don't want the artwork from Last.fm", ",lastfm url (url) (album)", "None"),
    lfm("lastfm lyrics", "Gets lyrics from Musixmatch for current song playing", ",lastfm lyrics (member)", "None"),
    lfm("lastfm whoknows", "View the top listeners for an artist in a guild", ",lastfm whoknows (artist)", "None", ["wk"]),
    lfm("lastfm soundcloud", "Gives Soundcloud link for the current song playing", ",lastfm soundcloud (member)", "None"),
    lfm("lastfm playing", "See what song everyone is listening to in a server", ",lastfm playing", "None"),
    lfm("lastfm vote", "Vote for submitted album artworks to display on the Now Playing command", ",lastfm vote (artist and album)", "None"),
    lfm("lastfm itunes", "Gives iTunes link for the current song playing", ",lastfm itunes (member)", "None"),
    lfm("lastfm recommendation", "Recommends a random artist from your library", ",lastfm recommendation (member)", "None"),
    lfm("lastfm toptenalbums", "View your top ten albums for an artist", ",lastfm toptenalbums (member) (artist)", "None"),
    lfm("lastfm score", "View your Last.fm score and statistics", ",lastfm score (member)", "None"),
    lfm("lastfm customreactions", "Set personal upvote and downvote reaction for Now Playing", ",lastfm customreactions (upvote) (downvote)", "Tier 1 Only"),
    lfm("lastfm spotify", "Gives Spotify link for the current song playing", ",lastfm spotify (member)", "None"),
    lfm("lastfm customcommand", "Set your own custom Now Playing command", ",lastfm customcommand (substring)", "None"),
    lfm("lastfm customcommand list", "View list of custom commands for NP", ",lastfm customcommand list", "Manage Guild"),
    lfm("lastfm customcommand reset", "Resets all custom commands", ",lastfm customcommand reset", "Manage Guild"),
    lfm("lastfm customcommand cleanup", "Clean up custom commands from absent members", ",lastfm customcommand cleanup", "Administrator"),
    lfm("lastfm customcommand remove", "Remove a custom command for a member", ",lastfm customcommand remove (member)", "Manage Guild"),
    lfm("lastfm customcommand public", "Toggle public flag for a custom command", ",lastfm customcommand public (substring)", "Manage Guild"),
    lfm("lastfm customcommand blacklist", "Blacklist users their own Now Playing command", ",lastfm customcommand blacklist (member)", "Manage Guild"),
    lfm("lastfm customcommand blacklist list", "View list of blacklisted custom command users for NP", ",lastfm customcommand blacklist list", "Manage Guild"),
    lfm("lastfm globalwhoknows", "View the top listeners for an artist globally", ",lastfm globalwhoknows (artist)", "None"),
    lfm("lastfm react", "Set server upvote and downvote reaction for Now Playing", ",lastfm react (upvote) (downvote)", "Manage Guild"),
    lfm("lastfm globalboard", "View the Last.fm globalboard (reactions)", ",lastfm globalboard", "None"),
    lfm("lastfm youtube", "Gives YouTube link for the current song playing", ",lastfm youtube (member)", "None"),
    lfm("lastfm globalwktrack", "View the top listeners for a track globally", ",lastfm globalwktrack (artist)", "None"),
    lfm("lastfm scoreboard", "View the Last.fm server scoreboard (reactions)", ",lastfm scoreboard", "None"),
    lfm("lastfm now", "Shows your current song playing from Last.fm", ",lastfm now (member)", "None", ["np"]),
    lfm("lastfm mostcrowns", "View a list of members with the most crowns", ",lastfm mostcrowns", "None"),
    lfm("lastfm globalwkalbum", "View the top listeners for an album globally", ",lastfm globalwkalbum (artist)", "None"),
    lfm("lastfm wktrack", "View the top listeners for a specific song by an artist", ",lastfm wktrack (track)", "None"),
    lfm("lastfm recent", "View your recent tracks", ",lastfm recent (member)", "None"),
    lfm("lastfm crowns", "View a list of your crowns", ",lastfm crowns (member)", "None"),
    lfm("lastfm toptentracks", "View your top ten tracks for an artist", ",lastfm toptentracks (member) (artist)", "None"),
    lfm("lastfm overview", "See your statistics for an artist", ",lastfm overview (member) (artistname)", "None"),
    lfm("lastfm wkalbum", "View the top listeners for an album by an artist", ",lastfm wkalbum (album)", "None"),
    lfm("lastfm recentfor", "View your recent tracks for an artist", ",lastfm recentfor (artist)", "None"),
    lfm("lastfm plays", "Check how many plays you have for an artist", ",lastfm plays (member) (artist)", "None"),
    lfm("lastfm login", "Login and authenticate Stained to use your account", ",lastfm login", "None"),
    lfm("nowplaying", "Shows your current song playing from Last.fm", ",nowplaying (member)", "None", ["np"]),
    lfm("itunes", "Finds a song from the iTunes API", ",itunes (song)", "None"),
    lfm("spotifyalbum", "Finds album results from the Spotify API", ",spotifyalbum (album)", "None"),
    lfm("spotifytrack", "Finds track results from the Spotify API", ",spotifytrack (track)", "None"),
  ],
};

const spotifyCategory = {
  slug: "spotify",
  name: "Spotify",
  description: "Connect your Spotify account, control playback, switch devices, and view listening stats.",
  commands: [
    lfm("spotify", "Control your music on Spotify through commands or search for a track. Get started with spotify login to connect your account.", ",spotify (track)", "None"),
    lfm("spotify unlike", "Unlike your current playing song on Spotify", ",spotify unlike", "None"),
    lfm("spotify device", "Change the device that you're listening to Spotify with", ",spotify device", "None"),
    lfm("spotify device list", "List all current devices connected to your Spotify account", ",spotify device list", "None"),
    lfm("spotify repeat", "Repeat the current song", ",spotify repeat (mode)", "None"),
    lfm("spotify seek", "Seek to position in current song", ",spotify seek (seconds)", "None"),
    lfm("spotify queue", "Queue a song", ",spotify queue (query)", "None"),
    lfm("spotify play", "Immediately skip to the requested song", ",spotify play (query)", "None"),
    lfm("spotify previous", "Skip to the previous song", ",spotify previous", "None"),
    lfm("spotify resume", "Resume the current song", ",spotify resume", "None"),
    lfm("spotify pause", "Pause the current song", ",spotify pause", "None"),
    lfm("spotify shuffle", "Toggle playback shuffle", ",spotify shuffle (option)", "None"),
    lfm("spotify login", "Grant Stained access to your Spotify account", ",spotify login", "None"),
    lfm("spotify next", "Skip to the next song", ",spotify next", "None"),
    lfm("spotify like", "Like your current playing song on Spotify", ",spotify like", "None"),
    lfm("spotify vc", "Play your current track in a voice channel", ",spotify vc", "None"),
    lfm("spotify logout", "Disconnect your Spotify from our servers", ",spotify logout", "None"),
    lfm("spotify toptracks", "Show top tracks for the specified time frame", ",spotify toptracks (duration)", "None"),
    lfm("spotify topartists", "Show top artists for the specified time frame", ",spotify topartists (duration)", "None"),
    lfm("spotify volume", "Adjust current player volume", ",spotify volume (percent)", "None"),
  ],
};

(referenceCommandCategories as unknown as Array<unknown>).push(spotifyCategory);
