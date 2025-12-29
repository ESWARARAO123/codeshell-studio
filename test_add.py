# Test Python file for terminal execution
def add_numbers(a, b):
    """
    Add two numbers and return the result
    
    Args:
        a (float): First number
        b (float): Second number
    
    Returns:
        float: Sum of a and b
    """
    try:
        result = a + b
        return result
    except TypeError as e:
        print(f"Error: {e}")
        return None

# Example usage
if __name__ == "__main__":
    num1 = 5
    num2 = 3
    result = add_numbers(num1, num2)
    print(f"{num1} + {num2} = {result}")
    print("Python code executed successfully!")