const moment = require('moment');

class JobOfferResource {

    id;
    title;
    expirationDate;
    locationInfo;
    fullfilled;

    constructor (_id, _title, _expiration, _location, _fullfulled) {
        this.id = _id;
        this.title = _title;
        this.expirationDate = _expiration;
        this.locationInfo = _location;
        this.fullfilled = _fullfulled;
    }

    static fromJobOffer (offer) {

        var expiresIn = moment(offer.expirationDate).format('DD/MM/YYYY');
        var location = offer.isRemote ? 'Remoto' : [
            offer.location.country,
            offer.location.state,
            offer.location.city
        ]
            .filter(v => v.length > 0)
            .join(' - ');

        return new JobOfferResource(
            offer._id,
            offer.title,
            expiresIn,
            location,
            offer.fulfilled
        );
    };

}

module.exports = JobOfferResource;