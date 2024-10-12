export const createTable = (tableData, tableHeadings) => {
  if(!tableData || !tableHeadings) return;

  const table = document.createElement('table');
  const headingRow = document.createElement('tr');
  document.body.appendChild(table); 
  table.append(headingRow)
  
  tableHeadings.map(item => {
    let header = document.createElement('th');
    header.append(item);
    headingRow.append(header);
  });
  
  tableData.map(student => {
    const dataRow = document.createElement('tr');
    tableHeadings.map(data => {
      const dataItem = document.createElement('td');
      dataItem.append(student[data])
      dataRow.append(dataItem)
    })
    table.append(dataRow);
  });
};