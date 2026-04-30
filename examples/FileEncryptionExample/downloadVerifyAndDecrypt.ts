import ReactNativeBlobUtil from 'react-native-blob-util';
import {virgilCrypto} from 'react-native-virgil-crypto';
import type {Keypair} from './encryptSignAndUpload';

type DownloadedImage = {
  downloadedFilePath: string;
  signature: string;
};

type VerifiedImage = DownloadedImage & {isSignatureVerified: boolean};
type DecryptedImage = VerifiedImage & {uri?: string};

const downloadImage = async (
  url: string,
  extension: string | null,
): Promise<DownloadedImage> => {
  const res = await ReactNativeBlobUtil.config({
    fileCache: true,
    appendExt: extension ?? undefined,
  }).fetch('GET', url);

  const {status, headers} = res.info();

  if (status !== 200) {
    const errorMessage = await res.text();
    throw new Error(
      `The server responded with status code ${status}; ${errorMessage}`,
    );
  }

  const signature = String(headers['x-signature'] ?? '');
  return {downloadedFilePath: res.path(), signature};
};

const verifyImageSignature = async (
  image: DownloadedImage,
  keypair: Keypair,
): Promise<VerifiedImage> => {
  const isSignatureVerified = await virgilCrypto.verifyFileSignature({
    inputPath: image.downloadedFilePath,
    signature: image.signature,
    publicKey: keypair.publicKey,
  });
  return {...image, isSignatureVerified};
};

const decryptImage = async (
  image: VerifiedImage,
  keypair: Keypair,
): Promise<DecryptedImage> => {
  if (!image.isSignatureVerified) {
    return image;
  }

  const decryptedFilePath = await virgilCrypto.decryptFile({
    inputPath: image.downloadedFilePath,
    // Custom output path is supported, e.g.:
    //   ReactNativeBlobUtil.fs.dirs.DocumentDir + '/decrypted_downloads/' + image.id + '.jpg'
    // If undefined, a temporary file is created.
    outputPath: undefined,
    privateKey: keypair.privateKey,
  });
  return {...image, uri: `file://${decryptedFilePath}`};
};

const cleanupAfterDownload = async (
  image: DecryptedImage,
): Promise<Omit<DecryptedImage, 'downloadedFilePath'>> => {
  const {downloadedFilePath, ...rest} = image;
  try {
    await ReactNativeBlobUtil.fs.unlink(downloadedFilePath);
  } catch (err) {
    console.log(
      `Failed to remove temporary download file at ${downloadedFilePath}`,
      err,
    );
  }
  return rest;
};

export const downloadVerifyAndDecryptImage = async ({
  url,
  keypair,
  extension,
}: {
  url: string;
  keypair: Keypair;
  extension: string | null;
}) => {
  const downloaded = await downloadImage(url, extension);
  const verified = await verifyImageSignature(downloaded, keypair);
  const decrypted = await decryptImage(verified, keypair);
  return cleanupAfterDownload(decrypted);
};
