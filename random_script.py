import sys
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

from pyVHR.signals.video import Video

# -- Video object
videoFilename = sys.argv[2]

Video.loadCropFaces = Video.saveCropFaces = False

video = Video(videoFilename)

# -- extract faces
video.getCroppedFaces(detector='mtcnn', extractor='opencv')
video.printVideoInfo()

# -- apply remote PPG method

#from pyVHR.methods.pos import POS
from pyVHR.methods.ssr import SSR
#from pyVHR.methods.pbv import PBV

params = {"video": video, "verb":0, "ROImask":"skin_adapt", "skinAdapt":0.2}

#pos = POS(**params)
ssr = SSR(**params)
#pbv = PBV(**params)

# -- get BPM values
#bpmES_pos, timesES_pos = pos.runOffline(**params)
bpmES_ssr, timesES_ssr = ssr.runOffline(**params)

li = []
for x in bpmES_ssr:
  li.append(x)

r.set(sys.argv[1], str(li))
print('calulated heart rate', str(li))
sys.stdout.flush()

