function toCreateTagDto(body) {
    return {
        name: body.name
    };
}

function toUpdateTagDto(body) {
    return {
        name: body.name
    };
}

module.exports = {
    toCreateTagDto,
    toUpdateTagDto
};