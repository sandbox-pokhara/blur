from subprocess import run

from django.http import FileResponse
from django.http import JsonResponse
from django.shortcuts import render


def index(request):
    return render(request, 'app/index.html')


def blur(request):
    start = request.POST['start']
    end = request.POST['end']
    with open('input.mp4', 'wb') as fp:
        fp.write(request.FILES['video'].read())
    run([
        'ffmpeg',
        '-y',
        '-i',
        'input.mp4',
        '-vf',
        # boxblur=10
        f'smartblur=luma_radius=4:enable=\'between(t,{start},{end})\'',
        '-c:a',
        'copy',
        'output.mp4',
    ])
    return FileResponse(open('output.mp4', 'rb'), as_attachment=True)
