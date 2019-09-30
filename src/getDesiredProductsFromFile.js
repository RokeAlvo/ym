exports.getDesiredProductsFromFile = async (filename) => {
    const file = await fs.open(filename);
    const buffer = await file.readFile();
    await file.close();
    const text =  buffer.toString();
    return text.split('\n').map(row=>row.split('\t')[1]);
}

