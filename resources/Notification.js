/**
 * convert BaseNotification type into JSON
 * @param {BaseNotification} notification 
 */
const baseNotificationToJson = function (notification) {
    return {
        id: notification._id,
        timestamp: notification.timestamp,
        isRead: notification.isRead
    };
};

/**
 * convert NewUserNotification type into Json
 * @param {NewUserNotification} notification 
 */
const newUserNotificationToJson = async function (notification) {
    var returnType = baseNotificationToJson(notification);
    returnType.title = "Se ha registrado un nuevo usuario";

    if (! notification.populated('user')) {
        await notification.populate('user').execPopulate();
    }

    let userName = notification.user ? notification.user.name : 'UNKNOWN';
    let hrefValue = notification.user
        ? `href='/users/edit/${notification.user._id}'`
        : '';

    returnType.body = `El usuario ${userName} se ha registrado en la plataforma. <a class='font-weight-bold notification-link' ${hrefValue} target='_blank'>Ver perfil</a>`;
    
    return returnType;
};

/**
 * convert WelcomeNotification type into Json
 * @param {WelcomeNotification} notification 
 */
const welcomeNotificationToJson = async function (notification) {
    var returnType = baseNotificationToJson(notification);
    returnType.title = "Bienvenido/a a Gestión RRHH!";

    if (! notification.populated('receiver')) {
        await notification.populate('receiver').execPopulate();
    }

    returnType.body = `Esperamos que tengas una excelente búsqueda en nuestra plataforma. Puedes editar tu perfil desde <a class='font-weight-bold notification-link' href='/users/edit/${notification.receiver.user}'>aquí</a>.`;

    return returnType;
};

/**
 * convert RequestRejectedNotification type into Json
 * @param {RequestRejectedNotification} notification 
 */
const rejectionNotificationToJson = async function (notification) {
    var returnType = baseNotificationToJson(notification);
    returnType.title = "Su postulación fue rechazada";

    if (! notification.populated('request')) {
        await notification.populate({
            path: 'request',
            populate: {
                path: 'job'
            }
        }).execPopulate();
    }

    let hrefValue = notification.request 
        ? `href='/jobs/request/${notification.request.job._id}'`
        : '';

    let jobTitle = notification.request ? notification.request.job.title : "UNKNOWN";

    returnType.body = `Su postulación para la oferta <a ${hrefValue} class='font-weight-bold notification-link' target='_blank'>${jobTitle}</a> no fue aceptada.`;

    if (notification.message) {
        returnType.body += ` El siguiente mensaje fue enviado por el anunciante: "${notification.message}"`;
    }

    return returnType;
};

/**
 * convert JobStateChangedNotification type into Json
 * @param {JobStateChangedNotification} notification 
 */
const jobStateChangedNotificationToJson = async function (notification) {
    var returnType = baseNotificationToJson(notification);

    if (! notification.populated('job')) {
        await notification.populate('job').execPopulate();
    }

    var hrefValue = notification.job ? `href='/jobs/request/${notification.job._id}'` : '';
    
    var jobName = notification.job ? notification.job.title : "UNKNOWN";

    if (! notification.fulfilled) {
        returnType.title = `Reapertura de oferta`;
        

        returnType.body = `La oferta <a ${hrefValue} class='font-weight-bold notification-link' target='_blank' >${jobName}</a> volvió a abrir su búsqueda de profesionales.`
        
    } else {
        returnType.title = `Cierre de oferta`;
        
        returnType.body = `La oferta <a ${hrefValue} class='font-weight-bold notification-link' target='_blank' >${jobName}</a> ha finalizado su búsqueda de profesionales.`

    }

    return returnType;
};

/**
 * convert JobDeletedNotification type into json
 * @param {JobDeletedNotification} notification 
 */
const jobDeletedNotificationToJson = async function (notification) {
    var returnType = baseNotificationToJson(notification);

    returnType.title = "Oferta de trabajo eliminada";

    returnType.body = `La oferta titulada <strong>${notification.jobTitle}</strong> ha sido removida de la plataforma. Ya no podrás postularte.`;

    return returnType;
};

/**
 * convert AdminNotification type into json type
 * @param {AdminNotification} notification 
 */
const adminNotificationToJson = function (notification) {
    var returnType = baseNotificationToJson(notification);

    returnType.title = "Notificación del Administrador";

    returnType.body = `Tienes una nueva notificación desde el Administrador: <br> 
    <p class='font-italic'>${notification.message}</p>`;

    return returnType;
};

/**
 * type mapping array. Maps notification model names to json conversion functions
 */
const typeMapping = {
    'NewUserNotification': newUserNotificationToJson,
    'WelcomeNotification': welcomeNotificationToJson,
    'RequestRejectedNotification': rejectionNotificationToJson,
    'JobStateChangedNotification': jobStateChangedNotificationToJson,
    'JobDeletedNotification': jobDeletedNotificationToJson,
    'AdminNotification': adminNotificationToJson
};

/**
 * gets the conversion function to apply to each notification
 * @param {BaseNotification} notification 
 */
const getConversionFunction = function (notification) {
    return typeMapping[notification.__t];
};


module.exports.convertManyToJson = function (notifications) {
    var result = notifications.map(nn => getConversionFunction(nn)(nn));
    return Promise.all(result);
};