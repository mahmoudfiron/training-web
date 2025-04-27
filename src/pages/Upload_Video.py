# 2_⬆️_Upload_Video.py

import av
import os
import sys
import streamlit as st
import cv2
import tempfile

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

from utils import get_mediapipe_pose
from process_frame import ProcessFrame
from thresholds import get_thresholds_beginner, get_thresholds_pro

# 🔵 New function that will be called from Flask
def run_upload_squat():
    st.set_page_config(page_title="Upload Squat Video", page_icon="📤")
    st.title('AI Fitness Trainer: Squats Analysis (Upload Video)')

    mode = st.radio('Select Mode', ['Beginner', 'Pro'], horizontal=True)

    thresholds = None 
    if mode == 'Beginner':
        thresholds = get_thresholds_beginner()
    elif mode == 'Pro':
        thresholds = get_thresholds_pro()

    upload_process_frame = ProcessFrame(thresholds=thresholds)
    pose = get_mediapipe_pose()

    download = None

    if 'download' not in st.session_state:
        st.session_state['download'] = False

    output_video_file = f'output_recorded.mp4'

    if os.path.exists(output_video_file):
        os.remove(output_video_file)

    with st.form('Upload', clear_on_submit=True):
        up_file = st.file_uploader("Upload a Video", ['mp4', 'mov', 'avi'])
        uploaded = st.form_submit_button("Upload")

    stframe = st.empty()

    ip_vid_str = '<p style="font-family:Helvetica; font-weight: bold; font-size: 16px;">Input Video</p>'
    warning_str = '<p style="font-family:Helvetica; font-weight: bold; color: Red; font-size: 17px;">Please Upload a Video first!!!</p>'

    warn = st.empty()

    download_button = st.empty()

    if up_file and uploaded:
        download_button.empty()
        tfile = tempfile.NamedTemporaryFile(delete=False)

        try:
            warn.empty()
            tfile.write(up_file.read())

            vf = cv2.VideoCapture(tfile.name)

            fps = int(vf.get(cv2.CAP_PROP_FPS))
            width = int(vf.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(vf.get(cv2.CAP_PROP_FRAME_HEIGHT))
            frame_size = (width, height)
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            video_output = cv2.VideoWriter(output_video_file, fourcc, fps, frame_size)

            txt = st.sidebar.markdown(ip_vid_str, unsafe_allow_html=True)
            ip_video = st.sidebar.video(tfile.name)

            while vf.isOpened():
                ret, frame = vf.read()
                if not ret:
                    break

                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                out_frame, _ = upload_process_frame.process(frame, pose)
                stframe.image(out_frame)
                video_output.write(out_frame[..., ::-1])

            vf.release()
            video_output.release()
            stframe.empty()
            ip_video.empty()
            txt.empty()
            tfile.close()

        except AttributeError:
            warn.markdown(warning_str, unsafe_allow_html=True)

    if os.path.exists(output_video_file):
        with open(output_video_file, 'rb') as op_vid:
            download = download_button.download_button('Download Video', data=op_vid, file_name='output_recorded.mp4')

        if download:
            st.session_state['download'] = True

    if os.path.exists(output_video_file) and st.session_state['download']:
        os.remove(output_video_file)
        st.session_state['download'] = False
        download_button.empty()

if __name__ == "__main__":
    run_upload_squat()
