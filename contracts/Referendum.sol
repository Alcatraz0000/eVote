//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//magari partendo da questo, si importa e si creano i propi dati, facciamo un contratto generico, e poi quello fisso
contract Referendum {
    //il tipo può cambiare voto una volta al giorno
    uint256 cooldowntime = 1 days;

    event NewVote(address add, uint8 vote);

    uint256 positiveVote;
    uint256 nullVote;
    uint256 negativeVote;

    constructor() {
        positiveVote = 100;
        nullVote = 3;
        negativeVote = 70;
    }

    mapping(address => uint8) public allVote;

    mapping(address => uint256) public lastVote;

    //3 is Positive, 2 is negative, 1 is Null
    function vote(uint8 _vote)
        public
        coolDown
        alreadyVote(_vote)
        returns (uint8)
    {
        allVote[msg.sender] = _vote;
        updateResult(_vote);
        return _vote;
    }

    function getVote() public view returns (uint8) {
        return allVote[msg.sender];
    }

    function getResult()
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (positiveVote, negativeVote, nullVote);
    }

    function returnWinner() public view returns (uint8) {
        //if positive is greater than negative, the yes win so true, otherwise false!
        if (positiveVote > negativeVote) return 2;
        else if (positiveVote == negativeVote) return 1;
        else return 0;
    }

    function updateResult(uint8 _vote) internal {
        if (_vote > 2) positiveVote++;
        else if (_vote > 1) negativeVote++;
        else nullVote++;
        lastVote[msg.sender] = block.timestamp;
        emit NewVote(msg.sender, _vote);
    }

    //if the user want to vote again the same vote already expressed, it cant do that!
    modifier alreadyVote(uint8 _vote) {
        //only if non ha mai votato, altrimenti vai avanti queto
        uint8 oldVote = allVote[msg.sender];
        if (oldVote != 0) {
            //ha gia votato in precedenza
            if (oldVote > 2) positiveVote--;
            else if (oldVote > 1) negativeVote--;
            else nullVote--;
        }
        _;
    }

    modifier coolDown() {
        require(lastVote[msg.sender] + cooldowntime <= block.timestamp);
        _;
    }
}
