class RecruiterResource {
    id;
    username;
    name;
    age;
    totalJobs = 0;
    totalWon = 0;
    totalLoosed = 0;

    constructor (_id, uname, name, age, tJ = 0, tW = 0, tL = 0) {
        this.id = _id;
        this.username = uname;
        this.name = name;
        this.age = age;
        this.totalJobs = tJ;
        this.totalWon = tW;
        this.totalLoosed = tL;
    }

    static async fromRecruiterCredentials (credentials) {
        var resource = new RecruiterResource(
            credentials.user._id,
            credentials.username,
            credentials.user.name,
            credentials.user.getAge()
        );
        
        var jobs = await credentials.user.findAnnouncedJobs();
        jobs.forEach((j, i) => {
            resource.totalJobs ++;
            if (j.fulfilled) { 
                resource.totalWon ++;
            } else if (j.hasExpired()) { 
                resource.totalLoosed ++;
            }
        });
        return resource;
    }

};

module.exports = RecruiterResource;