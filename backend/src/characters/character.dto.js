function toCreateCharacterDto(body) {
    return {
        name: body.name,
        universeId: body.universeId ?? body.universe_id,
        icon: body.icon ?? null,
        illustration: body.illustration ?? null,
        description: body.description ?? null,
        tagIds: body.tagIds ?? []
    };
}

function toUpdateCharacterDto(body) {
    return {
        name: body.name,
        universeId: body.universeId ?? body.universe_id,
        icon: body.icon ?? null,
        illustration: body.illustration ?? null,
        description: body.description ?? null,
        tagIds: body.tagIds ?? []
    };
}

module.exports = {
    toCreateCharacterDto,
    toUpdateCharacterDto
};