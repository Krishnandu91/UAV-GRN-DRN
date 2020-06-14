import os
import os.path


def analyse_output_files():
    """
    Function: analyse_output_files\n
    Functionality: Calculate the mean of the output files, provides the best and the worst output files\n
    """
    text_files = []
    minm_user_served = 999999999
    maxm_user_served = -99999999
    curr_user_served = 0
    worst_file = ''
    best_file = ''
    sum_user_served = 0
    total_files = 0
    for file in os.listdir('./output_files'):
        name, ext = os.path.splitext(file)
        if ext == '.txt':
            text_files.append(name + ext)
            total_files += 1
    for file in text_files:
        with open('./output_files/' + file, 'r') as file_pointer:
            lines = file_pointer.readlines()
            curr_user_served = int(lines[7].split(':')[1])
            sum_user_served += curr_user_served
            if curr_user_served < minm_user_served:
                minm_user_served = curr_user_served
                worst_file = './output_files/' + file
            if curr_user_served > maxm_user_served:
                maxm_user_served = curr_user_served
                best_file = './output_files/' + file
    print(f'#################################################################################')
    print (f'############################ Analysis Report ####################################')
    print(f'# Location of Best Output file is: {best_file}             #')
    print(f'# Location of Worst Output file is: {worst_file}           #')
    print(f'# Mean User Served: {sum_user_served / total_files}                                          #')
    print(f'#################################################################################')


if __name__ == "__main__":
    analyse_output_files()
