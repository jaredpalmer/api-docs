import { AedocDefinitions } from "@microsoft/api-extractor-model"
import { TSDocConfiguration, TSDocTagDefinition, TSDocTagSyntaxKind, StandardTags } from "@microsoft/tsdoc"

/**
 * Add support for `@production` and `@prototype` documentation blocks.
 *
 * We monkey-patch `AedocDefinitions` which `APIModel` uses to configure its block support.
 * There currently isn't an external API to add this behaviour.
 */

const configuration: TSDocConfiguration = new TSDocConfiguration()

const production = new TSDocTagDefinition({
    tagName: "@production",
    syntaxKind: TSDocTagSyntaxKind.BlockTag,
    allowMultiple: false,
})

const prototype = new TSDocTagDefinition({
    tagName: "@prototype",
    syntaxKind: TSDocTagSyntaxKind.BlockTag,
    allowMultiple: false,
})

configuration.addTagDefinitions(
    [
        AedocDefinitions.betaDocumentation,
        AedocDefinitions.internalRemarks,
        AedocDefinitions.preapprovedTag,
        production,
        prototype,
    ],
    true
)

configuration.setSupportForTags(
    [
        StandardTags.alpha,
        StandardTags.beta,
        StandardTags.defaultValue,
        StandardTags.deprecated,
        StandardTags.eventProperty,
        StandardTags.example,
        StandardTags.inheritDoc,
        StandardTags.internal,
        StandardTags.link,
        StandardTags.override,
        StandardTags.packageDocumentation,
        StandardTags.param,
        StandardTags.privateRemarks,
        StandardTags.public,
        StandardTags.readonly,
        StandardTags.remarks,
        StandardTags.returns,
        StandardTags.sealed,
        StandardTags.virtual,
        production,
        prototype,
    ],
    true
)

export function initCustomBlocks() {
    Object.defineProperty(AedocDefinitions, "tsdocConfiguration", {
        get: () => configuration,
    })
}
