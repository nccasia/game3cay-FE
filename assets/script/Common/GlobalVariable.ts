// export const hostname = "game-pocker-api.nccsoft.vn";
// export const hostname = "game-sam-api.nccsoft.vn";
export const hostname = "localhost";
export const port = 3200;
export const useSSL = false;
export const lobbyRoom = 'lobby_room';
export const gameInLobby = 'game_room_lobby';
export const gameRoom = 'game_room';
export const botId = '1840670551069167616';

export const clientNum = {
   value: 0,
};
export const myMezonInfo = {
   avatar: '',
   mail: '',
   name: '',
   id: '',
   money: 0,
   mezonToken: 0
};

export const apiConfig = {
   endpoints: {
      swapToken: "/swap-token",
      getBalance: "/get-balance",
      addBalance: "/add-balance",
      deductBalance: "/deduct-balance"
   }
};