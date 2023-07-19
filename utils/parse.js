export default function parse(decodedChunk) {
  const lines = decodedChunk.split('\n');
  const trimmedData = lines.map(line => line.replace(/^data: /, "").trim());
  const filteredData = trimmedData.filter(line => !["", "[DONE]"].includes(line));
  const parsedData = filteredData.map(line => JSON.parse(line));
  
  return parsedData;
}