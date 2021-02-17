import { Icon } from 'components/Base';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

export const CopyWithFeedback = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState<boolean>(false);

  return (
    <CopyToClipboard
      text={text}
      onCopy={() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      <Icon glyph="PrintFormCopy" size="1em" color={copied ? 'green' : null} />
    </CopyToClipboard>
  );
};
