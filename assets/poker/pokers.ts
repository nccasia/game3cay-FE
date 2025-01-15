const suitList = ["hearts", "diamonds", "clubs", "spades"];

const pokers = () => {
    let list: { suit: string; point: number }[] = [];
    suitList.forEach(suit => {
        for (let i = 1; i <= 9; i++) {
            list.push({
                suit,
                point: i
            });
        }
    });
    return list;
};

const shuffle = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const getPokers = () => {
    const list = pokers();
    return shuffle(list);
};
