# 1_📷️_Live_Stream.py

import av
import os
import sys
import streamlit as st
from streamlit_webrtc import VideoHTMLAttributes, webrtc_streamer
from aiortc.contrib.media import MediaRecorder

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

from utils import get_mediapipe_pose
from process_frame import ProcessFrame
from thresholds import get_thresholds_beginner, get_thresholds_pro

# 🔵 New function that will be called from Flask
def run_live_squat():
    st.set_page_config(page_title="Live Squat Trainer", page_icon="🧘")
    st.title('AI Fitness Trainer: Squats Analysis (Live Webcam)')

    mode = st.radio('Select Mode', ['Beginner', 'Pro'], horizontal=True)

    thresholds = None 
    if mode == 'Beginner':
        thresholds = get_thresholds_beginner()
    elif mode == 'Pro':
        thresholds = get_thresholds_pro()

    live_process_frame = ProcessFrame(thresholds=thresholds, flip_frame=True)
    pose = get_mediapipe_pose()

    if 'download' not in st.session_state:
        st.session_state['download'] = False

    output_video_file = f'output_live.flv'

    def video_frame_callback(frame: av.VideoFrame):
        frame = frame.to_ndarray(format="rgb24")
        frame, _ = live_process_frame.process(frame, pose)
        return av.VideoFrame.from_ndarray(frame, format="rgb24")

    def out_recorder_factory() -> MediaRecorder:
        return MediaRecorder(output_video_file)

    ctx = webrtc_streamer(
        key="Squats-pose-analysis",
        video_frame_callback=video_frame_callback,
        rtc_configuration={"iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]},
        media_stream_constraints={"video": {"width": {'min': 480, 'ideal': 480}}, "audio": False},
        video_html_attrs=VideoHTMLAttributes(autoPlay=True, controls=False, muted=False),
        out_recorder_factory=out_recorder_factory
    )

    download_button = st.empty()

    if os.path.exists(output_video_file):
        with open(output_video_file, 'rb') as op_vid:
            download = download_button.download_button('Download Video', data=op_vid, file_name='output_live.flv')
            if download:
                st.session_state['download'] = True

    if os.path.exists(output_video_file) and st.session_state['download']:
        os.remove(output_video_file)
        st.session_state['download'] = False
        download_button.empty()

if __name__ == "__main__":
    run_live_squat()
