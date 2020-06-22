import users_endpoint.users
import move_endpoint.movement
import grn_endpoint.grn_info


def is_equal(list_1, list_2):
    """
    Function: is_equal\n
    Parameters: list_1 -> first list, list_2 -> second list\n
    Return: True if both list_1 and list_2 are equal else False
    """
    if len(list_1) != len(list_2):
        return False
    len_list = 0
    for item in list_2:
        if item in list_1:
            len_list += 1
    if len_list == len(list_1):
        return True
    return False


def reward_function(UAV_node, placed, pos_i, UAV_location, t, power_UAV, UAV_to_UAV_threshold):
    """
    Function: reward_function\n
    Parameters: UAV_node -> the UAV which needs to be placed, placed -> list of already placed UAVs, pos_i -> current position of the UAV_node, UAV_location -> Dictionary storing locations of UAVs, t -> threshold distance of UAV, power_UAV -> power of UAV, UAV_to_UAV_threshold -> UAV to UAV communication threshold\n
    Returns: the reward for this configuration\n
    """
    neg_reward = 1
    pos_reward = 1
    user_connected_i = users_endpoint.users.get_users_cell_connections(pos_i)
    user_served_temp = set()
    ground_users = users_endpoint.users.get_number_ground_users()
    for user in user_connected_i:
        user_served_temp.add(user)
    edges_nodes = []
    for node1 in placed:
        pos_i = UAV_location[node1]
        for node2 in placed:
            pos_j = UAV_location[node2]
            if node1 != node2 and move_endpoint.movement.get_dist_UAV(pos_i, pos_j) <= UAV_to_UAV_threshold:
                edges_nodes.append(node1)
                edges_nodes.append(node2)
    for j in placed:
        pos_j = UAV_location[j]
        dist_UAV = move_endpoint.movement.get_dist_UAV(pos_i, pos_j)
        if dist_UAV >= UAV_to_UAV_threshold - t:
            pos_reward += 99
        else:
            neg_reward += 999999

        user_connected_j = users_endpoint.users.get_users_cell_connections(
            pos_j)
        for user in user_connected_j:
            user_served_temp.add(user)
        if is_equal(user_connected_i, user_connected_j):
            neg_reward += 999999
        if grn_endpoint.grn_info.is_edge_grn(grn_endpoint.grn_info.m(UAV_node), grn_endpoint.grn_info.m(j)) or grn_endpoint.grn_info.is_edge_grn(grn_endpoint.grn_info.m(j), grn_endpoint.grn_info.m(UAV_node)):
            pos_reward += 99
            if UAV_node not in edges_nodes and dist_UAV <= UAV_to_UAV_threshold:
                pos_reward += 9999
    if len(user_served_temp) / ground_users < 1:
        neg_reward += 999999
    if len(user_connected_i) == 0:
        pos_reward *= -99
    reward = pos_reward / neg_reward
    reward *= power_UAV
    return reward


def user_coverage_count(user, placed, UAV_location, radius_UAV, N, M):
    """
    Function: user_coverage_count\n
    Parameters: user-> user to be checked, placed -> list of UAVs already placed, UAV_location -> dict containing position of placed UAVs, radius_UAV -> radius of UAV, (N, M) -> size of the grid\n
    Returns: Calculated reward
    """
    user_conn = 0
    for j in placed:
        pos_j = UAV_location[j]
        if users_endpoint.users.is_user_connected(user, pos_j, radius_UAV, N, M):
            user_conn += 1
    if user_conn == 0:
        user_conn = 4
    else:
        user_conn /= len(placed)
        user_conn *= -4
    return user_conn


def reward_function_paper(UAV_node, placed, pos_i, UAV_location, t, power_UAV, UAV_to_UAV_threshold, radius_UAV, N, M):
    """
    Function: reward_function_paper\n
    Parameters: UAV_node -> the UAV which needs to be placed, placed -> list of already placed UAVs, pos_i -> current position of the UAV_node, UAV_location -> Dictionary storing locations of UAVs, t -> threshold distance of UAV, power_UAV -> power of UAV, UAV_to_UAV_threshold -> UAV to UAV communication threshold, radius_UAV -> radius of the UAV, (N, M) -> size of the grid\n
    Returns: the reward for this configuration\n
    """
    pos_reward = 1
    rho_reward = 0
    neg_reward = 1
    reward = 1
    ground_users = users_endpoint.users.get_number_ground_users()
    # RHO function
    for j in placed:
        pos_j = UAV_location[j]
        if move_endpoint.movement.get_dist_UAV(pos_i, pos_j) < UAV_to_UAV_threshold:
            rho_reward = 1
            break
    # Outer Summation
    for j in placed:
        pos_j = UAV_location[j]
        emc_reward = 0
        if grn_endpoint.grn_info.is_edge_grn(grn_endpoint.grn_info.m(UAV_node), grn_endpoint.grn_info.m(j)):
            emc_reward = (grn_endpoint.grn_info.get_emc(
                grn_endpoint.grn_info.m(UAV_node), grn_endpoint.grn_info.m(j)) + 1) / 3
        user_conn = 0
        for k in range(1, ground_users + 1):
            user_conn = 0
            if users_endpoint.users.is_user_connected(k, pos_i, radius_UAV, N, M):
                user_conn = 1
            user_conn *= user_coverage_count (k, placed, UAV_location, radius_UAV, N, M)
        user_den = ground_users * len (placed)
        user_conn /= user_den
        pos_reward = emc_reward + user_conn
        if move_endpoint.movement.get_dist_UAV(pos_i, pos_j) < t:
            neg_reward += 1
        reward += pos_reward / neg_reward
    reward *= power_UAV * rho_reward
    return reward
