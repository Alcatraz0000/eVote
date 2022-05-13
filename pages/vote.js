/* pages/create-post.js */
import { useState, useRef, useEffect } from "react"; // new
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { css } from "@emotion/css";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";

/* import contract address and contract owner address */
import { contractAddress } from "../config";

import Blog from "../artifacts/contracts/Referendum.sol/Referendum.json";

/* define the ipfs endpoint */
const client = create("https://ipfs.infura.io:5001/api/v0");

/* configure the markdown editor to be client-side import */
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const initialState = { vote: -1 };

function MyVerticallyCenteredModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Modal heading
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Centered Modal</h4>
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
          dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
          consectetur ac, vestibulum at eros.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

function CreatePost() {
  /* configure initial state to be used in the component */
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      /* delay rendering buttons until dynamic import is complete */
      setLoaded(true);
    }, 500);
  }, []);

  function onChange(e) {
    setVote(() => ({ ...vote, [e.target.name]: e.target.value }));
  }

  async function createNewPost(_vote) {
    /* saves post to ipfs then anchors to smart contract */
    console.log("sto x firmare con " + _vote);
    if (_vote == undefined) return;
    await savePost(_vote);
    router.push(`/`);
  }

  async function savePostToIpfs() {
    /* save post metadata to ipfs */
    try {
      const added = await client.add(JSON.stringify(post));
      return added.path;
    } catch (err) {
      console.log("error: ", err);
    }
  }

  async function savePost(_vote) {
    /* anchor post to smart contract */
    console.log("il voto" + _vote);
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, Blog.abi, signer);
      console.log("contract: ", contract);
      try {
        const val = await contract.vote(_vote);
        /* optional - wait for transaction to be confirmed before rerouting */

        await provider.waitForTransaction(val.hash);
        console.log("val: ", val);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  function triggerOnChange() {
    /* trigger handleFileChange handler of hidden file input */
    fileRef.current.click();
  }

  async function handleFileChange(e) {
    /* upload cover image to ipfs and save hash to state */
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    const added = await client.add(uploadedFile);
    setVote((state) => ({ ...state, coverImage: added.path }));
    setImage(uploadedFile);
  }

  return (
    <div className={container}>
      {loaded && (
        <>
          <button
            className={button}
            type="button"
            onClick={() => createNewPost(3)}
          >
            Vote Positive
          </button>
          <button
            className={button}
            type="button"
            onClick={() => createNewPost(1)}
          >
            Vote NullVote
          </button>
          <button
            className={button}
            type="button"
            onClick={() => createNewPost(2)}
          >
            Vote Negative
          </button>
        </>
      )}
    </div>
  );
}

const hiddenInput = css`
  display: none;
`;

const coverImageStyle = css`
  max-width: 800px;
`;

const mdEditor = css`
  margin-top: 40px;
`;

const titleStyle = css`
  margin-top: 40px;
  border: none;
  outline: none;
  background-color: inherit;
  font-size: 44px;
  font-weight: 600;
  &::placeholder {
    color: #999999;
  }
`;

const container = css`
  width: 800px;
  margin: 0 auto;
`;

const button = css`
  background-color: #fafafa;
  outline: none;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 10px;
  font-size: 18px;
  padding: 16px 70px;
  box-shadow: 7px 7px rgba(0, 0, 0, 0.1);
`;

export default CreatePost;
