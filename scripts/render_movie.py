# This script is an example of how you can run blender from the command line
# (in background mode with no interface) to automate tasks, in this example it
# creates a text object, camera and light, then renders and/or saves it.
# This example also shows how you can parse command line options to scripts.
#
# Example usage for this test.
#  
#./blender.app/Contents/MacOS/blender -b ready.blend --debug --background --python render_movie.py -- "/Users/gal/Desktop/gruvid/blender/myVideos/video1.mp4" "/Users/gal/Desktop/gruvid/blender/myVideos/video2.mp4" --render="/Users/gal/Desktop/gruvid/blender/output/"
#
# Notice:
# '--factory-startup' is used to avoid the user default settings from
#                     interfearing with automated scene generation.
#
# '--' causes blender to ignore all following arguments so python can use them.
#
# See blender --help for details.

import bpy
import subprocess

def render_movies(movies,render_path):    
    # load movies
    context = get_video_context()
    for movie in movies:
        movie_path = movie
        movie_name = movie_path.split('/')[-1]
        bpy.ops.sequencer.movie_strip_add(context,filepath=movie_path, files=[{"name":movie_name, "name":movie_name}], relative_path=True, frame_start=1, channel=1)
    # order (join) movies
    sce = bpy.context.scene
    seq = sce.sequence_editor
    last_frame = 0
    for strip in seq.sequences_all:
        strip.select = True
        bpy.ops.sequencer.snap(frame=last_frame)
        strip.select = False
        strip_type = strip.type
        print('strip_type: ' + strip_type + ' start: ' + str(strip.frame_final_start) + ' end: ' + str(strip.frame_final_end))
        if strip_type == 'SOUND':
            last_frame = strip.frame_final_end
    sce.frame_end = strip.frame_final_end
    print('scene __frame_end='+str(sce.frame_end)+'__')

    # render scene
    #render_scene(render_path)

def render_scene(render_path):
    render = bpy.data.scenes["Scene"].render
    render.use_file_extension = True
    render.use_overwrite = True
    render.filepath = render_path

    for scene in bpy.data.scenes:
        scene.render.image_settings.file_format = 'H264'
        scene.render.ffmpeg.format = 'QUICKTIME'
        scene.render.ffmpeg.audio_codec = 'AAC'
        scene.render.ffmpeg.audio_bitrate = 128
        scene.render.resolution_percentage = 50

    bpy.ops.render.render(animation=True)

def get_video_context():
    for area in bpy.context.screen.areas:
        if area.type == 'SEQUENCE_EDITOR':
            video_context = bpy.context.copy()
            video_context['area'] = area
            return video_context


def get_props_context():
    for area in bpy.context.screen.areas:
        if area.type == 'PROPERTIES':
            prop_context = bpy.context.copy()
            prop_context['area'] = area
            return prop_context

def retrieve_movies(movies):
    my_movies = []
    for movie in movies:
        if "amazonaws.com" in movie:
            bucket = movie.split('.')[0].split('/').pop()
            video_path = movie.split('amazonaws.com').pop()
            local_path = "/tmp/cache" + video_path
            return_code = subprocess.call("s3cmd get --force s3://" + bucket + video_path + " " + local_path, shell=True)
            if return_code==0:
                my_movies.append(local_path)
            else:
                print("Error getting the video from s3")
        else:
            my_movies.append(movie)
    return my_movies

def get_tmp_out_folder(render_path):
    return "/tmp/cache" + render_path.split('amazonaws.com').pop()

def main():
    import sys       # to get command line args
    import argparse  # to parse options for us and print a nice help message

    # get the args passed to blender after "--", all of which are ignored by
    # blender so scripts may receive their own arguments
    argv = sys.argv

    if "--" not in argv:
        argv = []  # as if no args are passed
    else:
        argv = argv[argv.index("--") + 1:]  # get all args after "--"

    # When --help or no args are given, print this help
    usage_text = \
    "Run blender in background mode with this script:"
    "  blender --background --python " + __file__ + " -- [options]"

    parser = argparse.ArgumentParser(description=usage_text)

    # Example utility, add some text and renders or saves it (with options)
    # Possible types are: string, int, long, choice, float and complex.
    parser.add_argument("movies", metavar='N', type=str, nargs='+',
            help="The list of movies")
    parser.add_argument("-rpath", "--render", dest="render_path", metavar='FILE', required=True,
            help="Render the movie to the specified path")

    args = parser.parse_args(argv)  # In this example we wont use the args

    if not argv:
        parser.print_help()
        return

    if not args.movies:
        print("Error: --movies=\"[movie1,movie2]\" argument not given, aborting.")
        parser.print_help()
        return

    # Run load movie function
    movies = retrieve_movies(args.movies)
    output_folder = get_tmp_out_folder(args.render_path)
    render_movies(movies, output_folder)

    print("batch job finished, exiting")


if __name__ == "__main__":
    main()
