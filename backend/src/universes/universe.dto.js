function toCreateUniverseDto(body) {
    return {
        name: body.name
    };
}

function toUpdateUniverseDto(body) {
    return {
        name: body.name
    };
}

module.exports = {
    toCreateUniverseDto,
    toUpdateUniverseDto
};