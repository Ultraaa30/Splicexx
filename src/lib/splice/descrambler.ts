export function descrambleSample(data: Uint8Array) {
    const dataSize = data
        .subarray(2, 10)
        .reduce(
            (accumulator, byte, index) => accumulator + byte * 256 ** index,
            0
        )
    const encodingBlock = String.fromCharCode(...data.subarray(10, 28))
    const audioData = data.slice(28)

    let passIndex = descramblePass(0, audioData, encodingBlock, dataSize) + dataSize
    descramblePass(passIndex, audioData, encodingBlock, passIndex + dataSize)

    return audioData
}

function descramblePass(
    startIndex: number,
    data: Uint8Array,
    encodingBlock: string,
    dataSize: number
) {
    // Writes past the end of data do nothing, so stop there. A bad header can declare
    // a huge dataSize (for example when the server returns an HTML error page), and
    // without this bound the loop would run for practically forever and freeze the app.
    const end = Math.min(dataSize, data.length)
    for (
        let index = startIndex, encodingIndex = 0;
        index < end;
        index++, encodingIndex = (encodingIndex + 1) % encodingBlock.length
    ) {
        data[index] ^= encodingBlock.charCodeAt(encodingIndex)
    }
    return Math.max(startIndex, dataSize)
}
