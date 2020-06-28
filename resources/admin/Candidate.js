module.exports.fromCandidate = function (candidate) {
    var output = {
        id: candidate._id,
        age: candidate.getAge()
    };

    ['name', 'location', 'skills']
        .forEach(kk => {
            output[kk] = candidate[kk];
        });

    return output;
};