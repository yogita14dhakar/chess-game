export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const GAME_OVER = 'game_over';
export const JOIN_GAME = 'join_game';
export const OPPONENT_DISCONNECTED = 'opponent_disconnected';
export const JOIN_ROOM = 'join_room';
export const GAME_NOT_FOUND = 'game_not_found';
export const GAME_JOINED = 'game_joined';
export const GAME_ENDED = 'game_ended';
export const GAME_ALERT = 'game_alert';
export const GAME_ADDED = 'game_added';
export const GAME_TIME = 'game_time';
export const EXIT_GAME = 'exit_game';
export const DRAW = 'DRAW'
export const DO_DRAW = 'do_draw';
export const USER_TIMEOUT = 'user_timeout';
export const IS_DRAW = 'is_draw';
export const EXIT = 'exit';

export enum GameStatus{COMPLETED='COMPLETED', IN_PROGRESS='IN_PROGRESS', ABANDONED='ABANDONED', TIME_UP='TIME_UP', PLAYER_EXIT='PLAYER_EXIT', PLAYER_RESIGN='PLAYER_RESIGN'}
export enum GameResult {WHITE_WINS='WHITE_WINS' , BLACK_WINS='BLACK_WINS', DRAW='DRAW'};
export enum AuthProvider {EMAIL='EMAIL', GOOGLE='GOOGLE', GITHUB='GITHUB', GUEST='GUEST'}