import * as crypto from "crypto"
import {
    ApiClass,
    ApiConstructor,
    ApiConstructSignature,
    ApiFunction,
    ApiItem,
    ApiItemKind,
    ApiMethod,
    ApiMethodSignature,
    ApiVariable,
    Parameter,
} from "@microsoft/api-extractor"

type ApiFunctionLike = ApiMethod | ApiMethodSignature | ApiFunction | ApiConstructSignature | ApiConstructor

/**
 * Shorter, mostly unique, id for use in the URL permalinks.
 */
export function toPermalink(item: ApiItem, id: string = toId(item)): string {
    const hash = crypto
        .createHash("sha1")
        .update(id)
        .digest("hex")
    return `${hash.slice(0, 6)}-${item.displayName.toLowerCase()}`
}

/**
 * Returns a unique identifier for the item based on TSDoc references
 * NOTE: The canonicalReference provided by api-extractor does not 1:1 map
 * to TSDoc so we try and work around this when possible there are still
 * many cases (especially around overloads) where TSDoc does not specify
 * the id. In these cases we go with api-extractor but TSDoc will not be
 * able to parse the @link tag due to unknown syntax.
 * See: https://github.com/Microsoft/tsdoc/blob/master/spec/code-snippets/DeclarationReferences.ts#L40-L60
 */
export function toId(item: ApiItem): string {
    // Exclude items above module level for the moment.
    const unsupported = new Set([ApiItemKind.None, ApiItemKind.Package, ApiItemKind.Model, ApiItemKind.EntryPoint])
    if (unsupported.has(item.kind)) {
        return ""
    }

    const references: string[] = []
    let current: ApiItem | undefined = item
    do {
        let reference: string | undefined
        if (current.kind === ApiItemKind.Variable) {
            // TSDoc expects variables to have :variable selector by default
            // api-extractor just uses the name.
            const variable = current as ApiVariable
            reference = `(${variable.name}:variable)`
        } else if (current.kind === ApiItemKind.Function) {
            // For some reason TSDoc expects functions with no overload
            // to be (funcName:function) and with overload (funcName:1)
            const func = current as ApiFunction
            if (func.overloadIndex === 0) {
                reference = `(${func.name}:function)`
            }
        } else if (current.kind === ApiItemKind.Method) {
            // For some reason TSDoc expects methods with no overload
            // to be (funcName:instance) and it does not define a spec for
            // overloaded methods.
            const func = current as ApiMethod
            if (func.overloadIndex === 0) {
                reference = `(${func.name}:${func.isStatic ? "static" : "instance"})`
            }
        } else if (current.kind === ApiItemKind.Constructor) {
            // constructors also have a completely different syntax with no
            // documented support for overloads
            const func = current as ApiConstructor
            const klass = func.parent as ApiClass
            if (func.overloadIndex === 0) {
                reference = `(${klass.name}:constructor)`
                // Skip the class from the keypath
                current = current.parent!
            }
        }

        if (!reference) {
            reference = current.canonicalReference
        }
        references.push(reference)
    } while ((current = current.parent) && !unsupported.has(current.kind))

    // Use canonical reference because many things e.g have multiple definitions
    // as well as supporting static/instance methods with the same fullname
    return references
        .reverse()
        .join(".")
        .toLowerCase()
}

export function toParameterId(method: ApiFunctionLike, param: Parameter): string {
    return `${toId(method)}.(${param.name.toLowerCase()}:parameter)`
}
