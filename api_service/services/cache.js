async function getVisibleClubs(clubId, result){
    let clubs = [];
    let subClubs = await models.club.find({pid : clubId});
    //没有subClub则直接跳过for
    for(let club of subClubs){
        clubs = clubs.concat(await getVisibleClubs(club._id, result));
    }
    if(clubId != null){
        clubs.push(clubId.toString());
        result[clubId] = clubs
    }
    return clubs;
}

module.exports = {
    refreshClubCache : async function(){
        let result = {};
        await getVisibleClubs(null, result)
        log.info('reload club cache', result);
        appCache.visibleClubs = result;
    }
}
