import React, { useState, useEffect } from 'react';
import { Upload, Icon, Button } from 'antd';

import socket from '../../../socket';
import Content from './Content';

function UploadTle() {
  /** Maintain list of uploaded files */
  const [files, setFiles] = useState([]);
  /** Loading state indicating when upload is occurring */
  const [loading, setLoading] = useState(false);
  /** Indicating if files are being uploaded or if you want to initiate an upload */
  const [buttonText, setButtonText] = useState('Upload Files');
  /** Outcome of upload */
  const [outcome, setOutcome] = useState('');
  /** Intermediary between file uploading and sending content to agent */
  const [fileContentUpload, setFileContentUpload] = useState(null);

  /** File reader to get contents of uploaded file */
  const getFileContents = file => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsText(file);
  });

  /** See if file was read successfully */
  const checkUpload = (request) => {
    setTimeout(() => {
      if (files.filter(file => (file.uid === request.file.uid))) {
        request.onSuccess(null, request.file);
      } else {
        checkUpload(request);
      }
    }, 100);
  };

  /** Extract file contents of uploaded files upon clicking button */
  const uploadFiles = async () => {
    setLoading(true);
    setButtonText('Uploading files ...');

    try {
      await Promise.all(files.map(async (file) => {
        try {
          const result = await getFileContents(file.originFileObj);

          setFileContentUpload(result);

          console.log(result);
        } catch (error) {
          console.log(error);
        }
      }));

      setFiles([]);

      setOutcome('Successfully uploaded all files!');
      setButtonText('Upload Files');
    } catch (error) {
      console.log(error);
      setOutcome('Error while attempting to upload files.');
    }

    setLoading(false);
  };

  /** Send content to agent */
  useEffect(() => {
    if (fileContentUpload !== null) {
      const upload = socket('query', '/command');

      // upload.onload = () => {
      //   upload.send(`masdr nordiasoft ${fileContentUpload}`);
      // };

      upload.onmessage = ({ data }) => {
        console.log(data);
      };
    }
  }, [fileContentUpload]);

  /** UI to reflect the outcome of the transaction */
  useEffect(() => {
    setTimeout(() => {
      setOutcome('');
    }, 5000);
  }, [outcome]);


  return (
    <Content
      name="Upload"
    >
      <Upload.Dragger
        fileList={files}
        onChange={(file) => {
          setFiles([...file.fileList]);
        }}
        customRequest={request => checkUpload(request)}
      >
        <Icon type="upload" />
        &nbsp;
        Select Files
      </Upload.Dragger>
      <br />
      <div className="text-center">
        <Button
          disabled={files.length === 0}
          type="primary"
          loading={loading}
          onClick={() => uploadFiles()}
          className="mb-3"
        >
          {buttonText}
        </Button>
        <div className="text-gray-500">
          {outcome}
        </div>
      </div>
    </Content>
  );
}

export default UploadTle;
