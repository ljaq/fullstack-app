import { useEffect, useRef, useState } from 'react';
import { getFileBuffer } from '../utils';
import { WorkSheet, read, utils } from 'xlsx';
import { Spin, Table, Tabs } from 'antd';
import canvasDatagrid from 'canvas-datagrid';
import { IFile } from '../type';

export default function Xls({ file }: { file: IFile }) {
  const [fileBuffer, setFileBuffer] = useState<Blob>();
  const [loding, setLoading] = useState(false);
  const [sheets, setSheets] = useState<{ [key in string]: WorkSheet }>({});
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    gridRef.current = canvasDatagrid({
      parentNode: ref.current,
      data: [],
      editable: false,
      style: {
        width: '100%',
        height: 'calc(100vh - 110px)',
        cellBackgroundColor: '#fff',
        gridBackgroundColor: '#fff',
      },
    });
    gridRef.current.style.width = '100%';
    gridRef.current.style.height = 'calc(100vh - 130px)';
  }, []);

  useEffect(() => {
    setLoading(true);
    getFileBuffer(file)
      .then(setFileBuffer)
      .finally(() => setLoading(false));
  }, [file]);

  useEffect(() => {
    if (fileBuffer) {
      const { Sheets, SheetNames } = read(fileBuffer, { type: 'buffer' });
      setSheetNames(SheetNames);
      setSheets(Sheets);
      setCurrentSheet(SheetNames[0]);
    }
  }, [fileBuffer]);

  useEffect(() => {
    if (sheetNames) {
      const json = utils.sheet_to_json(sheets[currentSheet]);
      gridRef.current.data = json;
    }
  }, [currentSheet, sheetNames, sheets]);

  return (
    <Spin spinning={loding} size="large">
      <div id="xls-preview">
        <Tabs
          activeKey={currentSheet}
          onChange={setCurrentSheet}
          items={sheetNames.map((name) => ({ label: name, key: name }))}
        />
        <div id="xls-container" ref={ref} />
      </div>
    </Spin>
  );
}
