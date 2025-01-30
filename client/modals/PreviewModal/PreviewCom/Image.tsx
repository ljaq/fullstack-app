import { Image as AntImage, ImageProps } from 'antd';
import { getFileFromName } from 'utils/file';
import { useLayoutEffect, useRef, useState } from 'react';
import { getFileUrl } from '../utils';
import { IFile } from '../type';

export default function Image({ file }: { file: IFile }) {
  const [preview, setPreview] = useState<ImageProps['preview']>();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    getFileUrl(file).then((src) => {
      setPreview({
        visible: true,
        src,
        getContainer: ref.current!,
      });
    });
  }, []);
  return (
    <div id="image-preview" ref={ref}>
      {<AntImage style={{ display: 'none' }} preview={preview} />}
    </div>
  );
}
